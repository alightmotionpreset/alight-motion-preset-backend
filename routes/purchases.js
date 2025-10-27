import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM am_purchases ORDER BY id DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const id = uuidv4();
  const { buyerName, presetId } = req.body;
  await db.query(
    "INSERT INTO am_purchases (id, buyerName, presetId, status) VALUES ($1,$2,$3,'pending')",
    [id, buyerName, presetId]
  );
  const { rows } = await db.query("SELECT * FROM am_purchases ORDER BY id DESC");
  res.status(201).json(rows);
});

router.patch("/:id/approve", async (req, res) => {
  const { id } = req.params;
  await db.query("UPDATE am_purchases SET status='approved' WHERE id=$1", [id]);
  const { rows } = await db.query("SELECT * FROM am_purchases ORDER BY id DESC");
  res.json(rows);
});

export default router;
