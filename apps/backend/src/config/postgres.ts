import pg from "pg";
import './env.ts'

const { Pool } = pg;
const postgresUrl = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString: postgresUrl,
});

export async function connectPostgres() {
  await pool.query("SELECT 1");
  console.log("Connected db");
}
export default pool;
