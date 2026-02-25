import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const kenyanCounties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni",
  "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu",
  "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo/Marakwet", "Nandi", "Baringo",
  "Laikipia", "Nakuru", "Narok", "Kajiado",
  "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii",
  "Nyamira", "Nairobi"
] as const;

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  whatsappNumber: text("whatsapp_number"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  county: text("county", { enum: kenyanCounties }).notNull(),
  role: text("role", { enum: ["buyer", "seller", "admin"] })
    .notNull()
    .default("buyer"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= LIVESTOCK ================= */

export const livestock = pgTable("livestock", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  breed: text("breed").notNull(),
  healthStatus: text("health_status").notNull(),
  county: text("county", { enum: kenyanCounties }).notNull(),
  imageUrl: text("image_url"),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= ORDERS ================= */

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => users.id),
  livestockId: integer("livestock_id")
    .notNull()
    .references(() => livestock.id),
  paymentStatus: text("payment_status", {
    enum: ["pending", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  transactionId: text("transaction_id"),
  invoiceNumber: text("invoice_number"),
  certificateNumber: text("certificate_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= RELATIONS ================= */

export const usersRelations = relations(users, ({ many }) => ({
  livestock: many(livestock),
  orders: many(orders),
}));

export const livestockRelations = relations(livestock, ({ one, many }) => ({
  seller: one(users, {
    fields: [livestock.sellerId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  livestock: one(livestock, {
    fields: [orders.livestockId],
    references: [livestock.id],
  }),
}));

/* ================= SCHEMAS ================= */

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLivestockSchema = createInsertSchema(livestock).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

/* ================= TYPES ================= */

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Livestock = typeof livestock.$inferSelect;
export type InsertLivestock = z.infer<typeof insertLivestockSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;