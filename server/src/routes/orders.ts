import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { getIO } from '../config/socket';
import { z } from 'zod';

const router = Router();

const orderSchema = z.object({
  tableId:   z.string().uuid(),
  sessionId: z.string().uuid(),
  notes:     z.string().optional(),
  items: z.array(z.object({
    menuItemId:          z.string().uuid(),
    quantity:            z.number().int().positive(),
    specialInstructions: z.string().optional(),
  })).min(1),
});

// POST /api/orders
router.post('/', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const { tableId, sessionId, notes, items } = result.data;

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map(i => i.menuItemId) } },
  });

  const order = await prisma.order.create({
    data: {
      tableId, sessionId, waiterId: req.user!.id, notes,
      items: {
        create: items.map(item => {
          const mi = menuItems.find(m => m.id === item.menuItemId)!;
          return {
            menuItemId: item.menuItemId,
            name:       mi.name,
            price:      mi.price,
            quantity:   item.quantity,
            specialInstructions: item.specialInstructions,
          };
        }),
      },
    },
    include: { items: { include: { menuItem: true } }, table: true, waiter: { select: { name: true } } },
  });

  // Notify kitchen via socket
  getIO().to('kitchen').emit('kitchen:new-order', order);
  getIO().to('admin').emit('admin:order-update', order);

  res.status(201).json(order);
});

// GET /api/orders — active orders (kitchen + waiters)
router.get('/', authenticate, async (_req, res: Response) => {
  const orders = await prisma.order.findMany({
    where:   { status: { notIn: ['BILLED'] } },
    include: { items: { include: { menuItem: true } }, table: true, waiter: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(orders);
});

// PATCH /api/orders/:id/items/:itemId  — kitchen updates item status
router.patch('/:id/items/:itemId', authenticate, requireRole('KITCHEN', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const item = await prisma.orderItem.update({
    where: { id: String(req.params.itemId) },
    data:  { status: req.body.status },
  });
  getIO().to('waiters').emit('waiter:item-ready', { orderId: req.params.id, itemId: item.id });
  res.json(item);
});

// PATCH /api/orders/:id/status  — waiter updates order status
router.patch('/:id/status', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data:  { status: req.body.status },
  });
  getIO().to('kitchen').emit('kitchen:order-updated', order);
  res.json(order);
});

export default router;