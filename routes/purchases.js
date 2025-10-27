import { Router } from "express";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_purchases (
      id SERIAL PRIMARY KEY,
      buyerName TEXT,
      presetId INTEGER,
      status TEXT DEFAULT 'pending'
    );
  `);
};

router.get("/", async (_, res) => {
  await ensureTable();
  const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  await ensureTable();
  const { buyerName, presetId } = req.body;
  await db.query("INSERT INTO am_purchases (buyerName, presetId) VALUES ($1,$2)", [buyerName, presetId]);
  const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
  res.json(result.rows);
});

router.put("/:id/approve", async (req, res) => {
  await ensureTable();
  await db.query("UPDATE am_purchases SET status='approved' WHERE id=$1", [req.params.id]);
  const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
  res.json(result.rows);
});

export default router;
