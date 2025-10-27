import pkg from "pg";
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");
    const res = await client.query("SELECT NOW()");
    console.log("🕒 Database time:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("❌ Database connection test failed:", err);
  }
})();

export default {
  query: (text, params) => pool.query(text, params),
};
