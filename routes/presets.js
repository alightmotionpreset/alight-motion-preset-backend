import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM am_presets ORDER BY name");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, categoryId, price, imageUrl, presetLink } = req.body;
  const id = uuidv4();
  await db.query(
    "INSERT INTO am_presets (id, name, categoryId, price, imageUrl, likes, presetLink) VALUES ($1,$2,$3,$4,$5,0,$6)",
    [id, name, categoryId, price, imageUrl, presetLink]
  );
  const { rows } = await db.query("SELECT * FROM am_presets ORDER BY name");
  res.status(201).json(rows);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM am_presets WHERE id=$1", [id]);
  const { rows } = await db.query("SELECT * FROM am_presets ORDER BY name");
  res.json(rows);
});

router.patch("/:id/like", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const { rows } = await db.query("SELECT * FROM am_presets WHERE id=$1", [id]);
  if (rows.length === 0) return res.status(404).json({ message: "Preset not found" });
  const preset = rows[0];
  const newLikes = action === "like" ? preset.likes + 1 : Math.max(0, preset.likes - 1);
  await db.query("UPDATE am_presets SET likes=$1 WHERE id=$2", [newLikes, id]);
  const { rows: updated } = await db.query("SELECT * FROM am_presets ORDER BY name");
  res.json(updated);
});

export default router;
