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