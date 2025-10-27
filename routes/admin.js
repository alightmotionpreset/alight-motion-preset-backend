import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();
const SALT_ROUNDS = 10;

// ✅ Status route
router.get("/status", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM am_admin");
    const isSetup = parseInt(result.rows[0].count) > 0;
    res.json({ isSetup });
  } catch (err) {
    console.error("Error checking admin status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Setup admin
router.post("/setup", async (req, res) => {
  try {
    const { password, pin } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    if (!pin || !/^[0-9]{12}$/.test(pin))
      return res.status(400).json({ message: "PIN must be exactly 12 digits." });

    const check = await db.query("SELECT COUNT(*) FROM am_admin");
    if (parseInt(check.rows[0].count) > 0)
      return res.status(400).json({ message: "Admin already exists." });

    const passwordhash = await bcrypt.hash(password, SALT_ROUNDS);
    const pinhash = await bcrypt.hash(pin, SALT_ROUNDS);
    await db.query("INSERT INTO am_admin (passwordhash, pinhash) VALUES ($1, $2)", [
      passwordhash,
      pinhash,
    ]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error setting up admin:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const result = await db.query("SELECT * FROM am_admin LIMIT 1");
    if (result.rows.length === 0)
      return res.status(401).json({ message: "No admin setup yet." });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.passwordhash);
    if (!match)
      return res.status(401).json({ message: "Incorrect password." });

    res.json({ success: true });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { pin, newPassword } = req.body;
    const result = await db.query("SELECT * FROM am_admin LIMIT 1");
    if (result.rows.length === 0)
      return res.status(400).json({ message: "No admin found." });

    const admin = result.rows[0];
    const pinMatch = await bcrypt.compare(pin, admin.pinhash);
    if (!pinMatch)
      return res.status(401).json({ message: "Incorrect recovery PIN." });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE am_admin SET passwordhash=$1", [newHash]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
