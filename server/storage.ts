import { db } from "./db";
import { users, livestock, orders, type InsertUser, type User, type InsertLivestock, type Livestock, type InsertOrder, type Order } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  createLivestock(livestockItem: InsertLivestock & { sellerId: number }): Promise<Livestock>;
  getLivestock(id: number): Promise<Livestock | undefined>;
  getAllLivestock(): Promise<Livestock[]>;
  getLivestockWithSeller(id: number): Promise<any>;
  getAllLivestockWithSeller(): Promise<any[]>;
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

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
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

  async getLivestockWithSeller(id: number): Promise<any> {
    const [l] = await db.select({
      id: livestock.id,
      title: livestock.title,
      description: livestock.description,
      price: livestock.price,
      breed: livestock.breed,
      healthStatus: livestock.healthStatus,
      county: livestock.county,
      imageUrl: livestock.imageUrl,
      createdAt: livestock.createdAt,
      seller: {
        id: users.id,
        name: users.name,
        phoneNumber: users.phoneNumber,
        whatsappNumber: users.whatsappNumber,
        county: users.county,
      },
    })
    .from(livestock)
    .leftJoin(users, eq(livestock.sellerId, users.id))
    .where(eq(livestock.id, id));
    return l;
  }

  async getAllLivestockWithSeller(): Promise<any[]> {
    return await db.select({
      id: livestock.id,
      title: livestock.title,
      description: livestock.description,
      price: livestock.price,
      breed: livestock.breed,
      healthStatus: livestock.healthStatus,
      county: livestock.county,
      imageUrl: livestock.imageUrl,
      createdAt: livestock.createdAt,
      seller: {
        id: users.id,
        name: users.name,
        phoneNumber: users.phoneNumber,
        whatsappNumber: users.whatsappNumber,
        county: users.county,
      },
    })
    .from(livestock)
    .leftJoin(users, eq(livestock.sellerId, users.id));
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