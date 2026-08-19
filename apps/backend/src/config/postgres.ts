import pg from 'pg';
import 'dotenv/config';

const {Pool} = pg;

const POSTGRES_USER = process.env.POSTGRES_USER; 
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_DB = process.env.POSTGRES_DB;
const POSTGRES_PORT = process.env.POSTGRES_PORT;
const POSTGRES_HOST = process.env.POSTGRES_HOST;

const postgresUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

const pool = new Pool({
  connectionString: postgresUrl
});

export async function connectPostgres(){
  console.log(postgresUrl)
  await pool.query("SELECT 1");
  console.log("Connected db")
}
export default pool;
 console.log(postgresUrl);
console.log(process.cwd());
