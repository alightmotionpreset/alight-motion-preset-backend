import { Router } from "express";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_presets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      categoryId INTEGER,
      price INTEGER DEFAULT 0,
      imageUrl TEXT,
      presetLink TEXT
    );
  `);
};

router.get("/", async (_, res) => {
  await ensureTable();
  const result = await db.query("SELECT * FROM am_presets ORDER BY id ASC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  await ensureTable();
  const { name, categoryId, price, imageUrl, presetLink } = req.body;
  await db.query(
    "INSERT INTO am_presets (name, categoryId, price, imageUrl, presetLink) VALUES ($1,$2,$3,$4,$5)",
    [name, categoryId, price, imageUrl, presetLink]
  );
  const result = await db.query("SELECT * FROM am_presets ORDER BY id ASC");
  res.json(result.rows);
});

router.delete("/:id", async (req, res) => {
  await ensureTable();
  await db.query("DELETE FROM am_presets WHERE id=$1", [req.params.id]);
  const result = await db.query("SELECT * FROM am_presets ORDER BY id ASC");
  res.json(result.rows);
});

export default router;
