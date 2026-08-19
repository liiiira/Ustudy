import express, {type Express, type Request, type Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import redis from './config/redis.ts' ;
import pool from './config/postgres.ts';

const VITE_PORT: number = parseInt(process.env.VITE_PORT!);

const app: Express = express();

 
app.use(express.json());
app.use(cors({
  origin: `http://localhost:${VITE_PORT}`,
}))


app.get("/", (req: Request, res: Response) => {
  return res.send("Hello world");
})

app.get("/data", (req: Request, res: Response) => {
  return res.json({value: "test test test"});
})

app.get("/test/redis", async (req: Request, res: Response) => {
  try{
    await redis.set("name", "Lyes", {EX: 100});
    const name = await redis.get("name");
    await redis.del("name");
    const val = await redis.get("name");
    return res.status(200).json({name: name, val: val});
  }catch(err){
    console.error("Failed to test redis ", err);
    return res.status(500).json({error: "Error in testing redis"})
  }
})

app.get("/test/postgres", async(req: Request, res: Response) => {
  try{
    const result = await pool.query("SELECT 1");
    return res.json(result.rows);


  }catch(err){
    console.error("Failed to test redis ", err);
    return res.status(500).json({error: "Error in testing redis"})

  }
})
export default app;
