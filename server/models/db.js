import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Reuse pool between serverless invocations to avoid exhausting Postgres connections.
// See: https://vercel.com/docs/concepts/functions/serverless-functions/other#database-connections
const globalAny = global;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const createPool = () => {
  const { Pool } = pg;
  if (!connectionString) {
    throw new Error(
      "No se encontro una cadena de conexion a Postgres. Configura DATABASE_URL o POSTGRES_URL.",
    );
  }

  return new Pool({
    connectionString,
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
