import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Reuse pool between serverless invocations to avoid exhausting Postgres connections.
// See: https://vercel.com/docs/concepts/functions/serverless-functions/other#database-connections
const globalAny = global;

const createPool = () => {
  const { Pool } = pg;
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
};

const pool = globalAny.__pgPool || createPool();
if (!globalAny.__pgPool) {
  globalAny.__pgPool = pool;
}

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.debug("executed query", { text, duration, rows: res.rowCount });
  return res;
}

export default pool;
