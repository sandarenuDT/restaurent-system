import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../utils/qrGenerator';

const router = Router();

// GET /api/tables
router.get('/', authenticate, async (_req, res: Response) => {
  const tables = await prisma.restaurantTable.findMany({ orderBy: { number: 'asc' } });
  res.json(tables);
});

// POST /api/tables
router.post('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const { number, capacity } = req.body;
  try {
    const tempId   = crypto.randomUUID();
    const qrCode   = await generateQRCode(tempId);
    const table    = await prisma.restaurantTable.create({
      data: { number, capacity, qrCode, qrCodeUrl: qrCode },
    });
    // update with real id
    const updated = await prisma.restaurantTable.update({
      where: { id: String(table.id) },
      data: { qrCode: await generateQRCode(table.id), qrCodeUrl: await generateQRCode(table.id) },
    });
    res.status(201).json(updated);
  } catch {
    console.error('Error creating table');
    res.status(400).json({ error: 'Table number already exists' });
  }
});

// PATCH /api/tables/:id/status
router.patch('/:id/status', authenticate, requireRole('ADMIN', 'WAITER'), async (req: AuthRequest, res: Response) => {
  const table = await prisma.restaurantTable.update({
    where: { id: String(req.params.id) },
    data:  { status: req.body.status },
  });
  res.json(table);
});

// DELETE /api/tables/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.restaurantTable.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Deleted' });
});

export default router;