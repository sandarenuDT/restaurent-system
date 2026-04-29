import { Server, Socket } from 'socket.io';

export const registerTableHandlers = (io: Server, socket: Socket): void => {
  socket.on('table:status-update', (data: { tableId: string; status: string; tableNumber: number }) => {
    io.emit('table:updated', data);
  });
};