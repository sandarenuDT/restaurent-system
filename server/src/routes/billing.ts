import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { calculateBill } from '../utils/billCalculator';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/billing/generate
router.post('/generate', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { orderId, discountPercent = 0 } = req.body;

  const order = await prisma.order.findUnique({
    where:   { id: orderId },
    include: { items: true },
  });
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  const restaurant = await prisma.restaurant.findFirst();
  const taxRate    = restaurant?.taxRate ?? 0.1;

  const { subtotal, taxAmount, discount, total } = calculateBill(order.items, taxRate, discountPercent);

  const bill = await prisma.bill.create({
    data: { orderId, sessionId: order.sessionId, subtotal, taxAmount, discount, total },
    include: { order: { include: { items: true, table: true } } },
  });

  await prisma.restaurantTable.update({ where: { id: order.tableId }, data: { status: 'BILL_REQUESTED' } });
  getIO().to('waiters').emit('waiter:bill-ready', bill);

  res.status(201).json(bill);
});

// PATCH /api/billing/:id/pay
router.patch('/:id/pay', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { paymentMethod } = req.body;

  const bill = await prisma.bill.update({
    where: { id: String(req.params.id) },
    data:  { status: 'PAID', paymentMethod, paidAt: new Date() },
    include: { order: true },
  });

  await prisma.order.update({ where: { id: bill.orderId }, data: { status: 'BILLED' } });
  await prisma.restaurantTable.update({ where: { id: bill.order.tableId }, data: { status: 'EMPTY' } });

  getIO().to('admin').emit('admin:payment-received', bill);
  getIO().emit('table:updated', { tableId: bill.order.tableId, status: 'EMPTY' });

  res.json(bill);
});

export default router;