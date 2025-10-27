// db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS am_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS am_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      categoryId TEXT REFERENCES am_categories(id) ON DELETE CASCADE,
      price INT,
      imageUrl TEXT,
      likes INT DEFAULT 0,
      presetLink TEXT
    );
    CREATE TABLE IF NOT EXISTS am_purchases (
      id TEXT PRIMARY KEY,
      buyerName TEXT,
      presetId TEXT,
      status TEXT DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS am_paymentinfo (
      id SERIAL PRIMARY KEY,
      gcashName TEXT,
      gcashNumber TEXT,
      paypalEmail TEXT
    );
    CREATE TABLE IF NOT EXISTS am_admin (
      id SERIAL PRIMARY KEY,
      passwordHash TEXT,
      pinHash TEXT
    );
  `);

  const { rows: catCount } = await pool.query("SELECT COUNT(*) FROM am_categories");
  if (parseInt(catCount[0].count) === 0) {
    await pool.query(`
      INSERT INTO am_categories (id, name) VALUES
      ('1', 'Trending'),
      ('2', 'Cinematic'),
      ('3', 'Aesthetic'),
      ('4', 'Vintage');
    `);
  }

  const { rows: presetCount } = await pool.query("SELECT COUNT(*) FROM am_presets");
  if (parseInt(presetCount[0].count) === 0) {
    await pool.query(`
      INSERT INTO am_presets (id, name, categoryId, price, imageUrl, likes, presetLink) VALUES
      ('p1', 'Urban Glow', '1', 150, 'https://picsum.photos/seed/urbanglow/400/300', 125, 'https://example.com/preset/urban-glow'),
      ('p2', 'Film Look', '2', 200, 'https://picsum.photos/seed/filmlook/400/300', 230, 'https://example.com/preset/film-look'),
      ('p3', 'Soft Vibe', '3', 120, 'https://picsum.photos/seed/softvibe/400/300', 410, 'https://example.com/preset/soft-vibe'),
      ('p4', 'Retro 80s', '4', 180, 'https://picsum.photos/seed/retro80s/400/300', 350, 'https://example.com/preset/retro-80s'),
      ('p5', 'Neon Nights', '1', 160, 'https://picsum.photos/seed/neonnights/400/300', 50, 'https://example.com/preset/neon-nights'),
      ('p6', 'Epic Movie', '2', 250, 'https://picsum.photos/seed/epicmovie/400/300', 180, 'https://example.com/preset/epic-movie');
    `);
  }

  const { rows: payCount } = await pool.query("SELECT COUNT(*) FROM am_paymentinfo");
  if (parseInt(payCount[0].count) === 0) {
    await pool.query(`
      INSERT INTO am_paymentinfo (gcashName, gcashNumber, paypalEmail)
      VALUES ('Juan Dela Cruz', '09171234567', 'juan.dela.cruz@example.com');
    `);
  }
};

await initializeDatabase();

export default pool;
