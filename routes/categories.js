import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  res.json(db.data.categories);
});

// POST /api/categories
router.post('/', async (req, res) => {
  const { name } = req.body;
  const newCategory = { id: uuidv4(), name };
  db.data.categories.push(newCategory);
  await db.write();
  res.status(201).json(db.data.categories);
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  // Delete category
  db.data.categories = db.data.categories.filter(c => c.id !== id);
  // Delete associated presets
  db.data.presets = db.data.presets.filter(p => p.categoryId !== id);
  await db.write();
  // Frontend expects a 204 No Content and will refetch data
  res.status(204).send();
});

export default router;
