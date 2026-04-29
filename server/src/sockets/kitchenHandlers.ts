import { Server, Socket } from 'socket.io';

export const registerKitchenHandlers = (io: Server, socket: Socket): void => {
  socket.on('kitchen:item-ready', (data: { orderId: string; itemId: string; tableNumber: number }) => {
    io.to('waiters').emit('waiter:item-ready', data);
  });

  socket.on('kitchen:order-ready', (data: { orderId: string; tableNumber: number }) => {
    io.to('waiters').emit('waiter:order-ready', data);
    io.to('admin').emit('admin:order-update', { ...data, status: 'ready' });
  });
};