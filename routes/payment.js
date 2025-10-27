import { Router } from "express";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_payment (
      id SERIAL PRIMARY KEY,
      gcashName TEXT,
      gcashNumber TEXT,
      paypalEmail TEXT
    );
  `);
  const existing = await db.query("SELECT COUNT(*) FROM am_payment");
  if (parseInt(existing.rows[0].count) === 0) {
    await db.query("INSERT INTO am_payment (gcashName, gcashNumber, paypalEmail) VALUES ('', '', '')");
  }
};

router.get("/", async (_, res) => {
  await ensureTable();
  const result = await db.query("SELECT * FROM am_payment LIMIT 1");
  res.json(result.rows[0]);
});

router.put("/", async (req, res) => {
  await ensureTable();
  const { gcashName, gcashNumber, paypalEmail } = req.body;
  await db.query("UPDATE am_payment SET gcashName=$1, gcashNumber=$2, paypalEmail=$3 WHERE id=1", [
    gcashName,
    gcashNumber,
    paypalEmail,
  ]);
  const result = await db.query("SELECT * FROM am_payment LIMIT 1");
  res.json(result.rows[0]);
});

export default router;
