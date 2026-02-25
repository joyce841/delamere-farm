import express, { Express, Response } from "express";
import { z } from "zod";
import { storage } from "./storage.js";
import { generateToken } from "./utils/jwt.js";
import { authenticateToken, requireRole, AuthRequest } from "./middleware/auth.js";
import { kenyanCounties } from "../shared/schema.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

console.log("🔥 routes.ts loaded");

const uploadDir = "uploads/livestock";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
    }
  },
});

// List of emails that automatically become admin
const ADMIN_EMAILS = [
  "joycechepkemoi976@gmail.com",
  "joycechepkemoi976+admin@gmail.com",
];

export function registerRoutes(app: Express) {
  console.log("✅ registerRoutes executing");

  // Static files
  app.use("/uploads", express.static("uploads"));

  // TEST ROUTE
  app.get("/api/test", (_req, res) => {
    res.json({ message: "API is working!", time: new Date().toISOString() });
  });

  // =====================================
  // REGISTER
  // =====================================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        phoneNumber: z.string().min(10, "Phone number is required"),
        whatsappNumber: z.string().optional(),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        county: z.enum(kenyanCounties),
        role: z.enum(["buyer", "seller"]).default("buyer"),
      });

      const input = schema.parse(req.body);

      // Secretly auto-assign admin for specific emails
      // Nobody else can ever become admin through the register form
      let role: "buyer" | "seller" | "admin" = input.role;
      if (ADMIN_EMAILS.includes(input.email.toLowerCase())) {
        role = "admin";
      }

      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(input.password, 10);

      const newUser = await storage.createUser({
        ...input,
        password: hashedPassword,
        role,
      });

      const token = generateToken(newUser.id, newUser.role);

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phoneNumber: newUser.phoneNumber,
          whatsappNumber: newUser.whatsappNumber,
        },
      });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // =====================================
  // LOGIN
  // =====================================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log("🔍 Login attempt:", email);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("❌ User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare with bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log("❌ Password mismatch");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("✅ Login successful for:", email);
      const token = generateToken(user.id, user.role);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          whatsappNumber: user.whatsappNumber,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET CURRENT USER
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        whatsappNumber: user.whatsappNumber,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // UPDATE PROFILE
  app.put("/api/auth/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { whatsappNumber } = req.body;
      if (!whatsappNumber) {
        return res.status(400).json({ message: "whatsappNumber is required" });
      }
      const updatedUser = await storage.updateUser(req.user!.id, { whatsappNumber });
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json({
        message: "Profile updated",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phoneNumber: updatedUser.phoneNumber,
          whatsappNumber: updatedUser.whatsappNumber,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET ALL LIVESTOCK
  app.get("/api/livestock", async (_req, res) => {
    try {
      const livestock = await storage.getAllLivestockWithSeller();
      res.json(livestock);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET SINGLE LIVESTOCK
  app.get("/api/livestock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const livestock = await storage.getLivestockWithSeller(id);
      if (!livestock) return res.status(404).json({ message: "Livestock not found" });
      res.json(livestock);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CREATE LIVESTOCK
  app.post(
    "/api/livestock",
    authenticateToken,
    requireRole(["seller", "admin"]),
    upload.single("image"),
    async (req: AuthRequest, res: Response) => {
      try {
        const schema = z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          price: z.string().min(1),
          breed: z.string().min(1),
          healthStatus: z.string().min(1),
          county: z.enum(kenyanCounties),
        });

        const input = schema.parse(req.body);
        let imageUrl: string | undefined;

        if (req.file) {
          imageUrl = `${req.protocol}://${req.get("host")}/uploads/livestock/${req.file.filename}`;
        }

        const newLivestock = await storage.createLivestock({
          ...input,
          imageUrl,
          sellerId: req.user!.id,
        });

        res.status(201).json({
          message: "Livestock created",
          livestock: newLivestock,
        });
      } catch (error: any) {
        console.error("Create livestock error:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  // DELETE LIVESTOCK
  app.delete(
    "/api/livestock/:id",
    authenticateToken,
    requireRole(["seller", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
        await storage.deleteLivestock(id);
        res.json({ message: "Livestock deleted" });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // CREATE ORDER
  app.post(
    "/api/orders",
    authenticateToken,
    requireRole(["buyer", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const schema = z.object({ livestockId: z.number() });
        const input = schema.parse(req.body);

        const livestock = await storage.getLivestockWithSeller(input.livestockId);
        if (!livestock) return res.status(404).json({ message: "Livestock not found" });

        const newOrder = await storage.createOrder({
          livestockId: input.livestockId,
          buyerId: req.user!.id,
          paymentStatus: "pending",
        });

        const buyer = await storage.getUser(req.user!.id);
        const sellerPhone = livestock.seller.whatsappNumber || livestock.seller.phoneNumber;

        const message = encodeURIComponent(
          `Hello ${livestock.seller.name},\n\nI'm interested in: ${livestock.title} (KES ${livestock.price})\n\nMy name: ${buyer?.name}\nMy phone: ${buyer?.phoneNumber}\n\nIs this available?`
        );

        const whatsappLink = sellerPhone
          ? `https://wa.me/${sellerPhone.replace(/\D/g, "")}?text=${message}`
          : null;

        res.status(201).json({
          message: "Order placed successfully",
          order: newOrder,
          whatsapp: { link: whatsappLink },
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // GET MY ORDERS
  app.get("/api/orders/my", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      const enhancedOrders = await Promise.all(
        orders.map(async (order) => {
          const livestock = await storage.getLivestockWithSeller(order.livestockId);
          return {
            ...order,
            livestock: livestock
              ? {
                  id: livestock.id,
                  title: livestock.title,
                  price: livestock.price,
                  breed: livestock.breed,
                  imageUrl: livestock.imageUrl,
                }
              : null,
            seller: livestock?.seller || null,
          };
        })
      );
      res.json(enhancedOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET SELLER'S OWN LIVESTOCK
  app.get("/api/my-livestock", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const livestock = await storage.getLivestockBySeller(req.user!.id);
      res.json(livestock);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADMIN - GET ALL USERS
  app.get(
    "/api/admin/users",
    authenticateToken,
    requireRole(["admin"]),
    async (_req, res: Response) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // ADMIN - DELETE USER
  app.delete(
    "/api/admin/users/:id",
    authenticateToken,
    requireRole(["admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
        await storage.deleteUser(id);
        res.json({ message: "User deleted" });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // ADMIN - GET ALL ORDERS
  app.get(
    "/api/admin/orders",
    authenticateToken,
    requireRole(["admin"]),
    async (_req, res: Response) => {
      try {
        const orders = await storage.getAllOrders();
        res.json(orders);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );
}