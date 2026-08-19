import pool, { connectPostgres} from '../src/config/postgres.ts';
import connectWithRetries from '../utils/connectWithRetries.ts';
import path from "node:path";
import { fileURLToPath } from "node:url";
import {readdirSync, readFileSync} from "node:fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_DIR = path.join(__dirname, "../migrations");

async function migrate(){
  let client;
  try{
     await connectWithRetries("postgres", connectPostgres);
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const applied = new Set(
      (await client.query("SELECT version FROM schema_migrations")).rows.map(r => r.version)
    );
      
    const files = readdirSync(MIGRATION_DIR).filter((f: string) : boolean => f.endsWith(".sql"));

    for (const file of files){
      // Migration already applied
      if (applied.has(file)) continue;

      const filePath = path.join(MIGRATION_DIR, file);
      const sqlScript = readFileSync(filePath, {encoding: "utf8"});
      
      try{
        await client.query("BEGIN");
        await client.query(sqlScript);
        await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [file]);
        await client.query("COMMIT");
        await client.query('END');
      }catch(err){
        await client.query('ROLLBACK');
        console.error("Transaction failed on ", file, err);
        process.exit(1);
      }   
    }
    console.log("Migration Done");
  }finally{
    if(client)
      client.release();
    pool.end();
      
  }
}
await migrate();
 
