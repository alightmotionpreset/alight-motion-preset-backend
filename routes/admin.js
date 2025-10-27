import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();
const SALT_ROUNDS = 10;

router.get("/status", async (req, res) => {
  const result = await db.query("SELECT COUNT(*) FROM am_admin");
  const isSetup = parseInt(result.rows[0].count) > 0;
  res.json({ isSetup });
});

router.post("/setup", async (req, res) => {
  const { password, pin } = req.body;
  const existing = await db.query("SELECT COUNT(*) FROM am_admin");
  if (parseInt(existing.rows[0].count) > 0) {
    return res.status(400).json({ message: "Admin account is already set up." });
  }

  if (!password || password.length < 6 || !pin || !/^[0-9]{12}$/.test(pin)) {
    return res.status(400).json({ message: "Invalid password or PIN format." });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
  await db.query("INSERT INTO am_admin (passwordHash, pinHash) VALUES ($1, $2)", [passwordHash, pinHash]);
  res.status(201).json({ message: "Admin account created successfully." });
});

router.post("/login", async (req, res) => {
  const { password } = req.body;
  const result = await db.query("SELECT * FROM am_admin LIMIT 1");
  if (result.rows.length === 0)
    return res.status(401).json({ message: "Admin account not set up." });

  const admin = result.rows[0];
  const match = await bcrypt.compare(password, admin.passwordhash);
  if (match) res.json({ success: true });
  else res.status(401).json({ message: "Incorrect password" });
});

router.post("/reset-password", async (req, res) => {
  const { pin, newPassword } = req.body;
  const result = await db.query("SELECT * FROM am_admin LIMIT 1");
  if (result.rows.length === 0)
    return res.status(400).json({ message: "Cannot reset password; account not set up correctly." });

  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters long." });

  const admin = result.rows[0];
  const pinMatch = await bcrypt.compare(pin, admin.pinhash);
  if (pinMatch) {
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE am_admin SET passwordHash=$1", [newHash]);
    res.json({ success: true, message: "Password has been reset successfully." });
  } else res.status(401).json({ message: "Incorrect recovery PIN." });
});

export default router;
