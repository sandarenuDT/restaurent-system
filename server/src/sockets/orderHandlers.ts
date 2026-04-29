import { Server, Socket } from 'socket.io';
import prisma from '../config/db';

export const registerOrderHandlers = (io: Server, socket: Socket): void => {
  socket.on('order:new', async (orderId: string) => {
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { items: true, table: true },
    });
    if (order) {
      io.to('kitchen').emit('kitchen:new-order', order);
      io.to('admin').emit('admin:order-update', order);
    }
  });

  socket.on('order:status-update', (data: { orderId: string; status: string }) => {
    io.to('waiters').emit('waiter:order-updated', data);
    io.to('admin').emit('admin:order-update', data);
  });
};