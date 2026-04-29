import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const staffSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['ADMIN', 'WAITER', 'KITCHEN']),
});

// GET /api/staff
router.get('/', authenticate, requireRole('ADMIN'), async (_req, res: Response) => {
  const staff = await prisma.staff.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.json(staff);
});

// POST /api/staff
router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const result = staffSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const { name, email, password, role } = result.data;
  const hashed = await bcrypt.hash(password, 12);
  try {
    const staff = await prisma.staff.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(staff);
  } catch {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// PATCH /api/staff/:id
router.patch('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const data: Record<string, unknown> = { ...req.body };
  if (req.body.password) data.password = await bcrypt.hash(req.body.password, 12);
  const staff = await prisma.staff.update({ where: { id: String(req.params.id) }, data });
  res.json({ id: staff.id, name: staff.name, email: staff.email, role: staff.role });
});

// DELETE /api/staff/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.staff.update({ where: { id: String(req.params.id) }, data: { isActive: false } });
  res.json({ message: 'Staff deactivated' });
});

export default router;