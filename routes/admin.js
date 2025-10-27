import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();
const SALT_ROUNDS = 10;

// ensure table exists
const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_admin (
      id SERIAL PRIMARY KEY,
      passwordHash TEXT NOT NULL,
      pinHash TEXT NOT NULL
    );
  `);
};

// get setup status
router.get("/status", async (req, res) => {
  try {
    await ensureTable();
    const result = await db.query("SELECT COUNT(*) FROM am_admin");
    const isSetup = parseInt(result.rows[0].count) > 0;
    res.json({ isSetup });
  } catch (err) {
    console.error("Error checking admin status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// setup admin
router.post("/setup", async (req, res) => {
  try {
    await ensureTable();
    const { password, pin } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    if (!pin || !/^[0-9]{12}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be exactly 12 digits." });
    }

    const existing = await db.query("SELECT COUNT(*) FROM am_admin");
    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
    await db.query("INSERT INTO am_admin (passwordHash, pinHash) VALUES ($1, $2)", [passwordHash, pinHash]);

    res.status(201).json({ success: true, message: "Admin account created successfully." });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Failed to create admin account." });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    await ensureTable();
    const { password } = req.body;
    const result = await db.query("SELECT * FROM am_admin LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No admin setup yet." });
    }
    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.passwordhash);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    res.json({ success: true, message: "Login successful." });
  } catch (err) {
    console.error("Error logging in admin:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// reset password
router.post("/reset-password", async (req, res) => {
  try {
    await ensureTable();
    const { pin, newPassword } = req.body;
    const result = await db.query("SELECT * FROM am_admin LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No admin found." });
    }
    const admin = result.rows[0];
    const pinMatch = await bcrypt.compare(pin, admin.pinhash);
    if (!pinMatch) {
      return res.status(401).json({ message: "Incorrect recovery PIN." });
    }
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE am_admin SET passwordHash=$1 WHERE id=$2", [newHash, admin.id]);
    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
