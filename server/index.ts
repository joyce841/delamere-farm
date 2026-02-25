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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Register all API routes first
registerRoutes(app);

// Auto-assign admin role on startup
async function setupAdmin() {
  try {
    const adminEmail = "joycechepkemoi976@gmail.com";
    const result = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, adminEmail))
      .returning();

    if (result.length > 0) {
      console.log(`✅ Admin role assigned to: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin user not found yet — will be assigned on registration`);
    }
  } catch (err) {
    console.error("❌ Admin setup error:", err);
  }
}
setupAdmin();

// Serve static frontend files
const staticPath = path.join(process.cwd(), "dist", "public");
console.log(`📂 Static path: ${staticPath}`);

if (fs.existsSync(staticPath)) {
  console.log("✅ Static folder found — serving frontend");
  app.use(express.static(staticPath));

  // SPA fallback using middleware — NOT app.get("*") which crashes Express 5
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.status(500).send("Frontend build missing.");
  });
} else {
  console.warn("⚠️ No static folder — API-only mode");
  app.get("/", (_req, res) => {
    res.json({ status: "Delamere Farm API running 🚜" });
  });
}

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});