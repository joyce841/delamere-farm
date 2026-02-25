import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

console.log("🔄 Registering routes...");
registerRoutes(app);
console.log("✅ Routes registered");

// Admin startup
async function setupAdminOnStartup() {
  try {
    const adminEmail = "joycechepkemoi976@gmail.com";
    const result = await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.email, adminEmail))
      .returning();
    if (result.length > 0) {
      console.log(`✅ Admin user updated: ${adminEmail}`);
    } else {
      console.log(`ℹ️ User ${adminEmail} not found – will be admin when they register`);
    }
  } catch (error) {
    console.error("Error setting up admin:", error);
  }
}
setupAdminOnStartup();

// ---------- Static file serving ----------
const staticPath = path.join(process.cwd(), "dist/public");
console.log(`📂 Attempting to serve static files from: ${staticPath}`);

if (fs.existsSync(staticPath)) {
  console.log("✅ Static folder found, serving...");
  app.use(express.static(staticPath));

  // ✅ FIXED: Use a named wildcard parameter for Express 5 compatibility
  app.get("/:splat*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error("❌ index.html not found in static folder!");
      res.status(500).send("Frontend build missing.");
    }
  });
} else {
  console.warn("⚠️ Static folder not found – API only mode. Frontend will not load.");
  app.get("/", (req, res) => {
    res.json({ message: "Delamere Farm Backend Running 🚜" });
  });
}

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test: http://localhost:${PORT}/api/test`);
});