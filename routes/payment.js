import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/payment-info
router.get('/', (req, res) => {
  res.json(db.data.paymentInfo);
});

// PUT /api/payment-info
router.put('/', async (req, res) => {
  db.data.paymentInfo = req.body;
  await db.write();
  res.json(db.data.paymentInfo);
});

export default router;
