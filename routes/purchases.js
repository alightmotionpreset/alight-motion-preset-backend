import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

// GET /api/purchases
router.get('/', (req, res) => {
  res.json(db.data.purchases);
});

// POST /api/purchases
router.post('/', async (req, res) => {
  const newPurchase = { id: uuidv4(), ...req.body };
  db.data.purchases.unshift(newPurchase); // Add to the beginning of the array
  await db.write();
  res.status(201).json(db.data.purchases);
});

// PATCH /api/purchases/:id/approve
router.patch('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const purchase = db.data.purchases.find(p => p.id === id);
  if (purchase) {
    purchase.status = 'approved';
    await db.write();
    // Return all purchases so the approved one disappears from the pending list
    res.json(db.data.purchases);
  } else {
    res.status(404).json({ message: 'Purchase not found' });
  }
});

export default router;
