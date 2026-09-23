import pg from "pg";
import "./env.ts";

const { Pool } = pg;
const postgresUrl = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString: postgresUrl,
});

// log how long each query takes, in dev only, never in test (too noisy) or
// in production. SLOW_QUERY_MS hides anything faster than the given threshold.
if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
  const slowMs = Number(process.env.SLOW_QUERY_MS ?? 0);
  const query = pool.query.bind(pool) as (
    ...args: unknown[]
  ) => Promise<unknown>;

  pool.query = (async (...args: unknown[]) => {
    const start = process.hrtime.bigint();
    try {
      return await query(...args);
    } finally {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      if (ms >= slowMs) {
        const first = args[0];
        const sql =
          typeof first === "string" ? first : (first as { text: string }).text;
        console.log(
          `   db ${ms.toFixed(1).padStart(6)}ms  ${sql.replace(/\s+/g, " ").trim().slice(0, 120)}`,
        );
      }
    }
  }) as typeof pool.query;
}

export async function connectPostgres() {
  await pool.query("SELECT 1");
}
export default pool;
