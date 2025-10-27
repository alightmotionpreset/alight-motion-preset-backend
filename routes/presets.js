import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_presets (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      categoryId INTEGER,
      price INTEGER DEFAULT 0,
      imageUrl TEXT,
      presetLink TEXT
    );
  `);
};

// 🔹 Get all presets
router.get("/", async (_, res) => {
  try {
    await ensureTable();
    const result = await db.query("SELECT * FROM am_presets ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching presets:", err);
    res.status(500).json({ message: "Failed to fetch presets" });
  }
});

// 🔹 Add a new preset
router.post("/", async (req, res) => {
  try {
    await ensureTable();
    const { name, categoryId, price, imageUrl, presetLink } = req.body;
    if (!name) return res.status(400).json({ message: "Preset name is required." });

    const id = uuidv4();
    await db.query(
      `INSERT INTO am_presets (id, name, categoryId, price, imageUrl, presetLink)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, categoryId || null, price || 0, imageUrl || "", presetLink || ""]
    );

    const result = await db.query("SELECT * FROM am_presets ORDER BY name ASC");
    res.status(201).json(result.rows);
  } catch (err) {
    console.error("Error adding preset:", err);
    res.status(500).json({ message: "Failed to add preset" });
  }
});

// 🔹 Delete a preset
router.delete("/:id", async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db.query("DELETE FROM am_presets WHERE id=$1", [id]);
    const result = await db.query("SELECT * FROM am_presets ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error deleting preset:", err);
    res.status(500).json({ message: "Failed to delete preset" });
  }
});

export default router;
