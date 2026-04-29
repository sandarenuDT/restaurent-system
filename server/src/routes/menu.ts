import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import { z } from 'zod';

const router = Router();

const itemSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  price:       z.number().positive(),
  categoryId:  z.string().uuid(),
  sortOrder:   z.number().int().optional(),
});

// GET /api/menu — public
router.get('/', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { items: { where: { available: true }, orderBy: { sortOrder: 'asc' } } },
  });
  res.json(categories);
});

// POST /api/menu/categories
router.post('/categories', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, sortOrder } = req.body;
  const category = await prisma.category.create({ data: { name, sortOrder } });
  res.status(201).json(category);
});

// POST /api/menu/items  (with image upload)
router.post('/items', authenticate, requireRole('ADMIN'), upload.single('image'), async (req: Request, res: Response) => {
  const parsed = itemSchema.safeParse({ ...req.body, price: Number(req.body.price) });
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const item = await prisma.menuItem.create({
    data: { ...parsed.data, imageUrl: (req.file as any)?.path },
  });
  res.status(201).json(item);
});

// PATCH /api/menu/items/:id
router.patch('/items/:id', authenticate, requireRole('ADMIN'), upload.single('image'), async (req: Request, res: Response) => {
  const data: Record<string, unknown> = { ...req.body };
  if (req.body.price)   data.price     = Number(req.body.price);
  if (req.body.available !== undefined) data.available = req.body.available === 'true';
  if (req.file)         data.imageUrl  = (req.file as any).path;

  const item = await prisma.menuItem.update({ where: { id: String(req.params.id) }, data });
  res.json(item);
});

// DELETE /api/menu/items/:id
router.delete('/items/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.menuItem.delete({ where: { id: String(req.params.id) } });
  res.json({ message: 'Deleted' });
});

export default router;