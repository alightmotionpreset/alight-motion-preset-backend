import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM am_paymentinfo LIMIT 1");
  res.json(rows[0] || {});
});

router.put("/", async (req, res) => {
  const { gcashName, gcashNumber, paypalEmail } = req.body;
  await db.query("DELETE FROM am_paymentinfo");
  await db.query(
    "INSERT INTO am_paymentinfo (gcashName, gcashNumber, paypalEmail) VALUES ($1,$2,$3)",
    [gcashName, gcashNumber, paypalEmail]
  );
  const { rows } = await db.query("SELECT * FROM am_paymentinfo LIMIT 1");
  res.json(rows[0]);
});

export default router;
