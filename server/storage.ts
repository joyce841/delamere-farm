import { db } from "./db";
import { users, livestock, orders, type InsertUser, type User, type InsertLivestock, type Livestock, type InsertOrder, type Order } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  createLivestock(livestockItem: InsertLivestock & { sellerId: number }): Promise<Livestock>;
  getLivestock(id: number): Promise<Livestock | undefined>;
  getAllLivestock(): Promise<Livestock[]>;
  deleteLivestock(id: number): Promise<void>;

  createOrder(order: InsertOrder & { buyerId: number }): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createLivestock(item: InsertLivestock & { sellerId: number }): Promise<Livestock> {
    const [l] = await db.insert(livestock).values(item).returning();
    return l;
  }

  async getLivestock(id: number): Promise<Livestock | undefined> {
    const [l] = await db.select().from(livestock).where(eq(livestock.id, id));
    return l;
  }

  async getAllLivestock(): Promise<Livestock[]> {
    return await db.select().from(livestock);
  }

  async deleteLivestock(id: number): Promise<void> {
    await db.delete(livestock).where(eq(livestock.id, id));
  }

  async createOrder(item: InsertOrder & { buyerId: number }): Promise<Order> {
    const [o] = await db.insert(orders).values(item).returning();
    return o;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.buyerId, userId));
  }
}

export const storage = new DatabaseStorage();
