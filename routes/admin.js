import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = Router();
const SALT_ROUNDS = 10;

// GET /api/admin/status
router.get('/status', (req, res) => {
  const isSetup = !!db.data.admin.passwordHash;
  res.json({ isSetup });
});

// POST /api/admin/setup
router.post('/setup', async (req, res) => {
  if (db.data.admin.passwordHash) {
    return res.status(400).json({ message: 'Admin account is already set up.' });
  }

  const { password, pin } = req.body;
  if (!password || password.length < 6 || !pin || !/^\d{12}$/.test(pin)) {
    return res.status(400).json({ message: 'Invalid password or PIN format.' });
  }
  
  db.data.admin.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  db.data.admin.pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
  await db.write();

  res.status(201).json({ message: 'Admin account created successfully.' });
});

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const { passwordHash } = db.data.admin;

  if (!passwordHash) {
    return res.status(401).json({ message: 'Admin account not set up.' });
  }

  const match = await bcrypt.compare(password, passwordHash);
  if (match) {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: 'Incorrect password' });
  }
});

// POST /api/admin/reset-password
router.post('/reset-password', async (req, res) => {
    const { pin, newPassword } = req.body;
    const { pinHash } = db.data.admin;

    if (!pinHash) {
        return res.status(400).json({ message: 'Cannot reset password; account not set up correctly.' });
    }
     if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const pinMatch = await bcrypt.compare(pin, pinHash);
    if (pinMatch) {
        db.data.admin.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.write();
        res.json({ success: true, message: "Password has been reset successfully." });
    } else {
        res.status(401).json({ message: 'Incorrect recovery PIN.' });
    }
});

export default router;
