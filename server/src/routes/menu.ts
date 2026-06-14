import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../config/cloudinary';

const router = Router();

const toBool = (v: any) => v === true || v === 'true';

// GET /api/menu — public, returns { data: [...] } to match frontend
router.get('/', async (_req: Request, res: Response) => {
  // category is a relation; order by related category name then sortOrder
const items = await prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
  res.json({ data: items });
});

// POST /api/menu/items — create with image
router.post('/items', authenticate, requireRole('ADMIN'), upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, prepTimeMinutes } = req.body;
    const tags = req.body.tags || {};

    if (!name?.trim()) { res.status(400).json({ message: 'Name is required' }); return; }
    if (!price || isNaN(Number(price))) { res.status(400).json({ message: 'Valid price is required' }); return; }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        category,
        price: Number(price),
        prepTimeMinutes: Number(prepTimeMinutes) || 15,
        imageUrl: (req.file as any)?.path,
        isVegetarian:  toBool(tags.isVegetarian),
        isVegan:       toBool(tags.isVegan),
        isGlutenFree:  toBool(tags.isGlutenFree),
        isSpicy:       toBool(tags.isSpicy),
        isPopular:     toBool(tags.isPopular),
        isChefSpecial: toBool(tags.isChefSpecial),
      },
    });

    res.status(201).json({ data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create item' });
  }
});

// PATCH /api/menu/items/:id
router.patch('/items/:id', authenticate, requireRole('ADMIN'), upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, prepTimeMinutes } = req.body;
    const tags = req.body.tags || {};
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const data: Record<string, unknown> = {};
    if (name !== undefined)        data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined)    data.category = category;
    if (price !== undefined)       data.price = Number(price);
    if (prepTimeMinutes !== undefined) data.prepTimeMinutes = Number(prepTimeMinutes);
    if (req.file)                  data.imageUrl = (req.file as any).path;

    if (tags.isVegetarian  !== undefined) data.isVegetarian  = toBool(tags.isVegetarian);
    if (tags.isVegan       !== undefined) data.isVegan       = toBool(tags.isVegan);
    if (tags.isGlutenFree  !== undefined) data.isGlutenFree  = toBool(tags.isGlutenFree);
    if (tags.isSpicy       !== undefined) data.isSpicy       = toBool(tags.isSpicy);
    if (tags.isPopular     !== undefined) data.isPopular     = toBool(tags.isPopular);
    if (tags.isChefSpecial !== undefined) data.isChefSpecial = toBool(tags.isChefSpecial);

    const item = await prisma.menuItem.update({ where: { id }, data });
    res.json({ data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// PATCH /api/menu/items/:id/toggle — availability toggle
router.patch('/items/:id/toggle', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const item = await prisma.menuItem.update({
    where: { id },
    data: { available: toBool(req.body.isAvailable) },
  });
  res.json({ data: item });
});

// DELETE /api/menu/items/:id
router.delete('/items/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await prisma.menuItem.delete({ where: { id } });
  res.json({ message: 'Deleted' });
});

export default router;