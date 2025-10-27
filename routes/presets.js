import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

// GET /api/presets
router.get('/', (req, res) => {
  res.json(db.data.presets);
});

// POST /api/presets
router.post('/', async (req, res) => {
  const { name, categoryId, price, imageUrl, presetLink } = req.body;
  const newPreset = {
    id: uuidv4(),
    name,
    categoryId,
    price: Number(price),
    imageUrl,
    presetLink,
    likes: 0
  };
  db.data.presets.push(newPreset);
  await db.write();
  res.status(201).json(db.data.presets);
});

// DELETE /api/presets/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  db.data.presets = db.data.presets.filter(p => p.id !== id);
  await db.write();
  res.json(db.data.presets);
});

// PATCH /api/presets/:id/like
router.patch('/:id/like', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'
    const preset = db.data.presets.find(p => p.id === id);

    if (preset) {
        if (action === 'like') {
            preset.likes += 1;
        } else if (action === 'unlike') {
            preset.likes = Math.max(0, preset.likes - 1);
        }
        await db.write();
        res.json(db.data.presets);
    } else {
        res.status(404).json({ message: 'Preset not found' });
    }
});


export default router;
