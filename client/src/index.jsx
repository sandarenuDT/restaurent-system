require("dotenv").config(); // ← MUST be line 1 before anything else

const http        = require("http");
const express     = require("express");
const cors        = require("cors");
const cookieParser= require("cookie-parser");
const morgan      = require("morgan");

const connectDB   = require("./config/db");
const { initSocket } = require("./config/socket");
const { connectCloudinary } = require("./config/cloudinary");

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const menuRoutes     = require("./routes/menu");
const tableRoutes    = require("./routes/tables");
const orderRoutes    = require("./routes/orders");
const sessionRoutes  = require("./routes/sessions");
const billingRoutes  = require("./routes/billing");
const adminRoutes    = require("./routes/admin");
const staffRoutes    = require("./routes/staff");

// ── Middleware imports ─────────────────────────────────────────────────────────
const { apiLimiter, authLimiter, errorHandler } = require("./middleware/errorHandler");

const app    = express();
const server = http.createServer(app); // Wrap express in http server for Socket.io

// ── 1. CORS — MUST be first middleware ────────────────────────────────────────
// This is the #1 reason Postman works but browser fails
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173", // exact URL, NOT "*"
  credentials: true,      // allow cookies (refresh token)
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── 2. Handle preflight OPTIONS requests ─────────────────────────────────────
// Browser sends OPTIONS before every cross-origin request
app.options("*", cors());

// ── 3. Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // needed to read req.cookies.refreshToken

// ── 4. Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── 5. Rate limiting ──────────────────────────────────────────────────────────
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// ── 6. Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/menu",    menuRoutes);
app.use("/api/tables",  tableRoutes);
app.use("/api/orders",  orderRoutes);
app.use("/api/sessions",sessionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/staff",   staffRoutes);

// ── 7. Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RestaurantOS API running 🍽️",
    env:     process.env.NODE_ENV,
    db:      "connected",
  });
});

// ── 8. 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── 9. Global error handler (must have 4 params) ──────────────────────────────
app.use(errorHandler);

// ── 10. Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  connectCloudinary();

  // Init Socket.io AFTER http server is created
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`🌍 Allowing requests from: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}\n`);
  });
};

start().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});