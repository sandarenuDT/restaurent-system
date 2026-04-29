import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  id: string;
  role: string;
}

interface AuthSocket extends Socket {
  user?: SocketUser;
}

let io: Server;

export const initSocket = (server: Server): void => {
  io = server;

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as SocketUser;
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`Socket connected: ${socket.id} | role: ${socket.user?.role}`);
    socket.on('join-room', (room: string) => socket.join(room));
    socket.on('disconnect', () => console.log(`Disconnected: ${socket.id}`));
  });
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};