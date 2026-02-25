import express, { Express, Response } from "express";
import { z } from "zod";
import { storage } from "./storage.js";
import { generateToken } from "./utils/jwt.js";
import { authenticateToken, requireRole, AuthRequest } from "./middleware/auth.js";
import { kenyanCounties } from "../shared/schema.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export function registerRoutes(app: Express) {
  console.log("✅ registerRoutes executing");

  // Static files
  app.use("/uploads", express.static("uploads"));
  console.log("✅ Static route: /uploads");

  // TEST ROUTE
  app.get("/api/test", (req, res) => {
    console.log("✅ TEST ROUTE HIT");
    res.json({ 
      message: "API is working!",
      time: new Date().toISOString(),
      routes: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "PUT /api/auth/profile",
        me: "GET /api/auth/me",
        livestock: "GET /api/livestock",
        createLivestock: "POST /api/livestock",
        orders: "POST /api/orders",
        myOrders: "GET /api/orders/my"
      }
    });
  });
  console.log("✅ Route: GET /api/test");

  // =====================================
  // REGISTER – with auto‑admin for specific email
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
        role: z.enum(["buyer", "seller", "admin"]).default("buyer"),
      });

      const input = schema.parse(req.body);

      // 👇 Auto‑assign admin for the specific email
      let role = input.role;
      if (input.email === "joycechepkemoi976@gmail.com") {
        role = "admin";
      }

      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const newUser = await storage.createUser({
        ...input,
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
  console.log("✅ Route: POST /api/auth/register (with auto‑admin)");

  // LOGIN - WITH DEBUG LOGS
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log("🔍 Login attempt for email:", email);
      
      const user = await storage.getUserByEmail(email);
      console.log("📦 User from DB:", user ? { 
        id: user.id, 
        email: user.email, 
        storedPassword: user.password,
        passwordLength: user.password?.length
      } : "NOT FOUND");

      if (!user) {
        console.log("❌ User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("🔑 Input password:", password);
      console.log("🔒 Stored password:", user.password);

      if (user.password !== password) {
        console.log("❌ Password mismatch");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("✅ Password match, generating token");
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
  console.log("✅ Route: POST /api/auth/login");

  // GET CURRENT USER
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        whatsappNumber: user.whatsappNumber,
      });
    } catch (error: any) {
      console.error("Me error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  console.log("✅ Route: GET /api/auth/me");

  // UPDATE PROFILE
  app.put("/api/auth/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { whatsappNumber } = req.body;
      
      if (!whatsappNumber) {
        return res.status(400).json({ message: "whatsappNumber is required" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, { whatsappNumber });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

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
      console.error("Profile update error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  console.log("✅ Route: PUT /api/auth/profile");

  // GET ALL LIVESTOCK
  app.get("/api/livestock", async (req, res) => {
    try {
      const livestock = await storage.getAllLivestockWithSeller();
      res.json(livestock);
    } catch (error: any) {
      console.error("Get livestock error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  console.log("✅ Route: GET /api/livestock");

  // GET SINGLE LIVESTOCK
  app.get("/api/livestock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const livestock = await storage.getLivestockWithSeller(id);
      if (!livestock) {
        return res.status(404).json({ message: "Livestock not found" });
      }
      res.json(livestock);
    } catch (error: any) {
      console.error("Get livestock error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  console.log("✅ Route: GET /api/livestock/:id");

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
  console.log("✅ Route: POST /api/livestock");

  // ORDERS - CREATE with WhatsApp redirect
  app.post(
    "/api/orders",
    authenticateToken,
    requireRole(["buyer", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        console.log("📝 ORDER CREATION ATTEMPT");
        console.log("User:", req.user);
        console.log("Body:", req.body);

        const schema = z.object({
          livestockId: z.number(),
        });

        const input = schema.parse(req.body);

        const livestock = await storage.getLivestockWithSeller(input.livestockId);
        if (!livestock) {
          return res.status(404).json({ message: "Livestock not found" });
        }

        const newOrder = await storage.createOrder({
          livestockId: input.livestockId,
          buyerId: req.user!.id,
          paymentStatus: "pending",
        });

        const buyer = await storage.getUser(req.user!.id);
        const sellerPhone = livestock.seller.whatsappNumber || livestock.seller.phoneNumber;
        
        const message = encodeURIComponent(
          `Hello ${livestock.seller.name},\n\n` +
          `I'm interested in: ${livestock.title} (KES ${livestock.price})\n\n` +
          `My name: ${buyer?.name}\n` +
          `My phone: ${buyer?.phoneNumber}\n\n` +
          `Is this available?`
        );

        const whatsappLink = sellerPhone 
          ? `https://wa.me/${sellerPhone.replace(/\D/g, '')}?text=${message}`
          : null;

        console.log("✅ Order created successfully");

        res.status(201).json({
          message: "Order placed successfully",
          order: newOrder,
          whatsapp: {
            link: whatsappLink,
          },
        });

      } catch (error: any) {
        console.error("Create order error:", error);
        res.status(500).json({ message: error.message });
      }
    }
  );
  console.log("✅ Route: POST /api/orders");

  // GET MY ORDERS
  app.get(
    "/api/orders/my",
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const orders = await storage.getOrdersByUser(req.user!.id);
        
        const enhancedOrders = await Promise.all(
          orders.map(async (order) => {
            const livestock = await storage.getLivestockWithSeller(order.livestockId);
            return {
              ...order,
              livestock: livestock ? {
                id: livestock.id,
                title: livestock.title,
                price: livestock.price,
                breed: livestock.breed,
                imageUrl: livestock.imageUrl,
              } : null,
              seller: livestock?.seller || null,
            };
          })
        );

        res.json(enhancedOrders);
      } catch (error: any) {
        console.error("Get my orders error:", error);
        res.status(500).json({ message: error.message });
      }
    }
  );
  console.log("✅ Route: GET /api/orders/my");
}