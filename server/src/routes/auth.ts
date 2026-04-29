import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }

  const { email, password } = result.data;
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff || !(await bcrypt.compare(password, staff.password))) {
    res.status(401).json({ error: 'Invalid credentials' }); return;
  }

  const payload = { id: staff.id, role: staff.role };
  res.json({
    accessToken:  generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
});

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(401).json({ error: 'No refresh token' }); return; }
  try {
    const payload = verifyRefreshToken(refreshToken);
    res.json({ accessToken: generateAccessToken({ id: payload.id, role: payload.role }) });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/seed  (dev only)
router.post('/seed', async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') { res.status(403).json({ error: 'Forbidden' }); return; }
  const hash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.staff.upsert({
    where:  { email: 'admin@restaurant.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@restaurant.com', password: hash, role: 'ADMIN' },
  });
  res.json({ message: 'Seed done', email: admin.email, password: 'admin123' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const staff = await prisma.staff.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(staff);
});

export default router;