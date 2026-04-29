import { Server, Socket } from 'socket.io';

export const registerBillingHandlers = (io: Server, socket: Socket): void => {
  socket.on('billing:request', (data: { tableId: string; tableNumber: number }) => {
    io.to('waiters').emit('waiter:bill-requested', data);
    io.to('admin').emit('admin:bill-requested', data);
  });

  socket.on('billing:paid', (data: { tableId: string; tableNumber: number; total: number }) => {
    io.to('admin').emit('admin:payment-received', data);
    io.emit('table:updated', { tableId: data.tableId, status: 'EMPTY' });
  });
};