import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../dist/public");
  console.log(`📂 Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));

  // For any request that doesn't match an API route, serve index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    console.log(`📄 Serving index.html for ${req.path}`);
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  // In development, serve the JSON message for root
  app.get("/", (req, res) => {
    res.json({ message: "Delamere Farm Backend Running 🚜" });
  });
}

// Test route (always available)
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