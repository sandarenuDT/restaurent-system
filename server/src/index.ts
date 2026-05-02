import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initSocket, getIO } from './config/socket';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import { registerOrderHandlers }  from './sockets/orderHandlers';
import { registerKitchenHandlers } from './sockets/kitchenHandlers';
import { registerTableHandlers }  from './sockets/tableHandlers';
import { registerBillingHandlers } from './sockets/billingHandlers';

import authRoutes    from './routes/auth';
import menuRoutes    from './routes/menu';
import tableRoutes   from './routes/tables';
import orderRoutes   from './routes/orders';
import sessionRoutes from './routes/sessions';
import billingRoutes from './routes/billing';
import adminRoutes   from './routes/admin';
import staffRoutes   from './routes/staff';

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*' },
});

initSocket(io);

io.on('connection', (socket) => {
  registerOrderHandlers(io, socket);
  registerKitchenHandlers(io, socket);
  registerTableHandlers(io, socket);
  registerBillingHandlers(io, socket);
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(globalLimiter);

app.use('/api/auth',     authRoutes);
app.use('/api/menu',     menuRoutes);
app.use('/api/tables',   tableRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/billing',  billingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/staff',    staffRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { getIO };

// import dotenv from "dotenv";
// dotenv.config(); // MUST be first

// import http from "http";
// import express, {
//   Application,
//   Request,
//   Response,
// } from "express";

// import cors from "cors";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";

// import connectDB from "./config/db";
// import { initSocket } from "./config/socket";
// import { connectCloudinary } from "./config/cloudinary";

// // ── Route imports ──────────────────────────────────────────────────────────────
// import authRoutes from "./routes/auth";
// import menuRoutes from "./routes/menu";
// import tableRoutes from "./routes/tables";
// import orderRoutes from "./routes/orders";
// import sessionRoutes from "./routes/sessions";
// import billingRoutes from "./routes/billing";
// import adminRoutes from "./routes/admin";
// import staffRoutes from "./routes/staff";

// // ── Middleware imports ─────────────────────────────────────────────────────────
// import {
//   apiLimiter,
//   authLimiter,
//   errorHandler,
// } from "./middleware/errorHandler";

// const app: Application = express();

// const server = http.createServer(app);

// // ── 1. CORS ───────────────────────────────────────────────────────────────────
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // ── 2. Handle preflight OPTIONS requests ─────────────────────────────────────
// app.options("*", cors());

// // ── 3. Body parsers ───────────────────────────────────────────────────────────
// app.use(express.json({ limit: "10mb" }));

// app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());

// // ── 4. Logging ────────────────────────────────────────────────────────────────
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// // ── 5. Rate limiting ──────────────────────────────────────────────────────────
// app.use("/api", apiLimiter);

// app.use("/api/auth", authLimiter);

// // ── 6. Routes ─────────────────────────────────────────────────────────────────
// app.use("/api/auth", authRoutes);

// app.use("/api/menu", menuRoutes);

// app.use("/api/tables", tableRoutes);

// app.use("/api/orders", orderRoutes);

// app.use("/api/sessions", sessionRoutes);

// app.use("/api/billing", billingRoutes);

// app.use("/api/admin", adminRoutes);

// app.use("/api/staff", staffRoutes);

// // ── 7. Health check ───────────────────────────────────────────────────────────
// app.get("/api/health", (req: Request, res: Response) => {
//   res.json({
//     success: true,
//     message: "RestaurantOS API running 🍽️",
//     env: process.env.NODE_ENV,
//     db: "connected",
//   });
// });

// // ── 8. 404 handler ────────────────────────────────────────────────────────────
// app.use((req: Request, res: Response) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.path} not found`,
//   });
// });

// // ── 9. Global error handler ──────────────────────────────────────────────────
// app.use(errorHandler);

// // ── 10. Start server ─────────────────────────────────────────────────────────
// const PORT: number = Number(process.env.PORT) || 5000;

// const start = async (): Promise<void> => {
//   try {
//     await connectDB();

//     connectCloudinary();

//     // Init Socket.io
//     initSocket(server);

//     server.listen(PORT, () => {
//       console.log(`\n🚀 Server running on http://localhost:${PORT}`);

//       console.log(`📡 Socket.io ready`);

//       console.log(
//         `🌍 Allowing requests from: ${
//           process.env.CLIENT_URL || "http://localhost:5173"
//         }`
//       );

//       console.log(`📦 Environment: ${process.env.NODE_ENV}\n`);
//     });
//   } catch (err) {
//     console.error("❌ Server failed to start:", err);

//     process.exit(1);
//   }
// };

// start();