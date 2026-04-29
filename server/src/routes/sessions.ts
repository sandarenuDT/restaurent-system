import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/sessions — waiter starts a session for a table
router.post('/', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { tableId, guestCount } = req.body;
  const session = await prisma.session.create({
    data: { tableId, waiterId: req.user!.id, guestCount },
    include: { table: true, waiter: { select: { name: true } } },
  });
  await prisma.restaurantTable.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
  res.status(201).json(session);
});

// GET /api/sessions/active — active sessions
router.get('/active', authenticate, async (_req, res: Response) => {
  const sessions = await prisma.session.findMany({
    where: { isActive: true },
    include: {
      table: true,
      waiter: { select: { name: true } },
      orders: { include: { items: true } },
    },
  });
  res.json(sessions);
});

// PATCH /api/sessions/:id/end
router.patch('/:id/end', authenticate, requireRole('WAITER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const session = await prisma.session.update({
    where: { id: String(req.params.id) },
    data:  { isActive: false, endedAt: new Date() },
  });
  await prisma.restaurantTable.update({ where: { id: session.tableId }, data: { status: 'EMPTY' } });
  res.json(session);
});

export default router;