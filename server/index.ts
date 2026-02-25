import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

// 👇 Admin startup (checks for existing user)
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// API routes
console.log("🔄 Registering routes...");
registerRoutes(app);
console.log("✅ Routes registered");

// 👇 One‑time admin setup (runs on server start)
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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the dist/public directory
  const staticPath = path.join(__dirname, "../dist/public");
  app.use(express.static(staticPath));

  // For any request that doesn't match an API route, serve index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"));
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