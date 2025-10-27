import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS am_purchases (
      id UUID PRIMARY KEY,
      buyerName TEXT,
      presetId UUID,
      status TEXT DEFAULT 'pending'
    );
  `);
};

// 🔹 Get all purchases
router.get("/", async (_, res) => {
  try {
    await ensureTable();
    const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
});

// 🔹 Add a new purchase
router.post("/", async (req, res) => {
  try {
    await ensureTable();
    const { buyerName, presetId } = req.body;
    if (!buyerName || !presetId)
      return res.status(400).json({ message: "buyerName and presetId are required." });

    const id = uuidv4();
    await db.query(
      "INSERT INTO am_purchases (id, buyerName, presetId) VALUES ($1,$2,$3)",
      [id, buyerName, presetId]
    );

    const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
    res.status(201).json(result.rows);
  } catch (err) {
    console.error("Error adding purchase:", err);
    res.status(500).json({ message: "Failed to add purchase" });
  }
});

// 🔹 Approve purchase
router.put("/:id/approve", async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db.query("UPDATE am_purchases SET status='approved' WHERE id=$1", [id]);
    const result = await db.query("SELECT * FROM am_purchases ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error approving purchase:", err);
    res.status(500).json({ message: "Failed to approve purchase" });
  }
});

export default router;
