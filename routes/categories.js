// routes/categories.js
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

// Get all categories
router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM am_categories ORDER BY name");
  res.json(rows);
});

// Add a new category
router.post("/", async (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  await db.query("INSERT INTO am_categories (id, name) VALUES ($1, $2)", [id, name]);

  const { rows } = await db.query("SELECT * FROM am_categories ORDER BY name");
  res.status(201).json(rows);
});

// Delete a category (and related presets)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM am_presets WHERE categoryId=$1", [id]);
  await db.query("DELETE FROM am_categories WHERE id=$1", [id]);

  const { rows: updatedCategories } = await db.query("SELECT * FROM am_categories ORDER BY name");
  const { rows: updatedPresets } = await db.query("SELECT * FROM am_presets ORDER BY name");

  res.json({ updatedCategories, updatedPresets });
});

export default router;
