import { db } from "./db";
import { users, livestock, orders } from "@shared/schema";
import bcrypt from "bcrypt";

async function main() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded");
    return;
  }

  const password = await bcrypt.hash("password123", 10);

  const [admin] = await db.insert(users).values({
    name: "Admin User",
    phoneNumber: "0700000000",
    email: "admin@delamere.com",
    password,
    county: "Nairobi",
    role: "admin",
  }).returning();

  const [seller] = await db.insert(users).values({
    name: "John Farmer",
    phoneNumber: "0711111111",
    email: "john@delamere.com",
    password,
    county: "Nakuru",
    role: "seller",
  }).returning();

  const [buyer] = await db.insert(users).values({
    name: "Jane Buyer",
    phoneNumber: "0722222222",
    email: "jane@delamere.com",
    password,
    county: "Kiambu",
    role: "buyer",
  }).returning();

  const [cow] = await db.insert(livestock).values({
    title: "Healthy Friesian Cow",
    description: "A 3-year-old high milk yielding Friesian cow. Great health, vaccinated.",
    price: "85000",
    breed: "Friesian",
    healthStatus: "Excellent",
    county: "Nakuru",
    sellerId: seller.id,
  }).returning();

  const [goat] = await db.insert(livestock).values({
    title: "Boer Goat for Breeding",
    description: "Strong Boer goat perfect for cross-breeding. Dewormed.",
    price: "15000",
    breed: "Boer",
    healthStatus: "Good",
    county: "Baringo",
    sellerId: seller.id,
  }).returning();

  await db.insert(orders).values({
    buyerId: buyer.id,
    livestockId: cow.id,
    paymentStatus: "completed",
    transactionId: "TXN-987654321",
  });

  console.log("Database seeded successfully");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});