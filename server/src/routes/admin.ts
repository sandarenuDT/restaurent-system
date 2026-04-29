import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireRole('ADMIN'), async (_req, res: Response) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [todayBills, totalOrders, tableStats, topItems] = await Promise.all([
    prisma.bill.findMany({
      where: { status: 'PAID', paidAt: { gte: today } },
      select: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.restaurantTable.groupBy({ by: ['status'], _count: true }),
    prisma.orderItem.groupBy({
      by: ['name'],
      _sum:   { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const revenue = todayBills.reduce((s, b) => s + b.total, 0);

  res.json({
    todayRevenue:    +revenue.toFixed(2),
    todayOrders:     totalOrders,
    tableStatus:     tableStats,
    topMenuItems:    topItems,
  });
});

// GET /api/admin/reports?from=&to=
router.get('/reports', authenticate, requireRole('ADMIN'), async (req, res: Response) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 86400000);
  const to   = req.query.to   ? new Date(req.query.to as string)   : new Date();

  const bills = await prisma.bill.findMany({
    where:   { status: 'PAID', paidAt: { gte: from, lte: to } },
    include: { order: { include: { table: true } } },
    orderBy: { paidAt: 'asc' },
  });

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);

  res.json({ from, to, totalRevenue: +totalRevenue.toFixed(2), bills });
});

export default router;