import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/jwt";
import { authenticateToken, requireRole, AuthRequest } from "./middleware/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });
      const token = generateToken(user.id, user.role);
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken(user.id, user.role);
      res.status(200).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req: AuthRequest, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json(user);
  });

  // Livestock Routes
  app.get(api.livestock.list.path, async (req, res) => {
    const list = await storage.getAllLivestock();
    res.status(200).json(list);
  });

  app.get(api.livestock.get.path, async (req, res) => {
    const item = await storage.getLivestock(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Livestock not found" });
    res.status(200).json(item);
  });

  app.post(api.livestock.create.path, authenticateToken, requireRole(["seller", "admin"]), async (req: AuthRequest, res) => {
    try {
      // numeric schema coercion
      const input = api.livestock.create.input.extend({
        price: z.union([z.string(), z.number()]).transform(v => String(v))
      }).parse(req.body);
      
      const item = await storage.createLivestock({ ...input, sellerId: req.user!.id });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.livestock.delete.path, authenticateToken, requireRole(["admin"]), async (req, res) => {
    const item = await storage.getLivestock(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    await storage.deleteLivestock(Number(req.params.id));
    res.status(204).send();
  });

  // Orders Routes
  app.post(api.orders.create.path, authenticateToken, requireRole(["buyer", "admin"]), async (req: AuthRequest, res) => {
    try {
      const input = api.orders.create.input.extend({
        livestockId: z.coerce.number()
      }).parse(req.body);
      const order = await storage.createOrder({ ...input, buyerId: req.user!.id, paymentStatus: "completed", transactionId: "mock-tx-123" });
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.orders.myOrders.path, authenticateToken, async (req: AuthRequest, res) => {
    const list = await storage.getOrdersByUser(req.user!.id);
    res.status(200).json(list);
  });

  // Admin Routes
  app.get(api.admin.users.path, authenticateToken, requireRole(["admin"]), async (req, res) => {
    const users = await storage.getAllUsers();
    res.status(200).json(users);
  });

  app.get(api.admin.livestock.path, authenticateToken, requireRole(["admin"]), async (req, res) => {
    const list = await storage.getAllLivestock();
    res.status(200).json(list);
  });

  return httpServer;
}
