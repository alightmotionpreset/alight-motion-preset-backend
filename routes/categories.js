import { Router } from "express";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
};

router.get("/", async (_, res) => {
  await ensureTable();
  const result = await db.query("SELECT * FROM am_categories ORDER BY id ASC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  await ensureTable();
  if (!name) return res.status(400).json({ message: "Name required." });
  await db.query("INSERT INTO am_categories (name) VALUES ($1)", [name]);
  const result = await db.query("SELECT * FROM am_categories ORDER BY id ASC");
  res.json(result.rows);
});

router.delete("/:id", async (req, res) => {
  await ensureTable();
  await db.query("DELETE FROM am_categories WHERE id=$1", [req.params.id]);
  const result = await db.query("SELECT * FROM am_categories ORDER BY id ASC");
  res.json(result.rows);
});

export default router;
