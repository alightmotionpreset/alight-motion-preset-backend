// routes/admin.js
import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();
const SALT_ROUNDS = 10;

// Check if admin exists
router.get("/status", async (req, res) => {
  const result = await db.query("SELECT COUNT(*) FROM am_admin");
  const isSetup = parseInt(result.rows[0].count) > 0;
  res.json({ isSetup });
});

// Setup admin
router.post("/setup", async (req, res) => {
  try {
    const { password, pin } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (!pin || !/^[0-9]{12}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be exactly 12 digits." });
    }

    const check = await db.query("SELECT COUNT(*) FROM am_admin");
    if (parseInt(check.rows[0].count) > 0) {
      return res.status(400).json({ message: "Admin already set up." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
    await db.query("INSERT INTO am_admin (passwordHash, pinHash) VALUES ($1, $2)", [passwordHash, pinHash]);

    res.status(201).json({ success: true, message: "Admin account created successfully." });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const result = await db.query("SELECT * FROM am_admin LIMIT 1");
  if (result.rows.length === 0) return res.status(401).json({ message: "No admin setup yet." });

  const admin = result.rows[0];
  const match = await bcrypt.compare(password, admin.passwordhash);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  res.json({ success: true });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { pin, newPassword } = req.body;
  const result = await db.query("SELECT * FROM am_admin LIMIT 1");
  if (result.rows.length === 0) return res.status(400).json({ message: "No admin found." });

  const admin = result.rows[0];
  const pinMatch = await bcrypt.compare(pin, admin.pinhash);
  if (!pinMatch) return res.status(401).json({ message: "Incorrect recovery PIN." });

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.query("UPDATE am_admin SET passwordHash=$1", [newHash]);
  res.json({ success: true, message: "Password reset successfully." });
});

export default router;
