import express, {type Express, type Request, type Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import pool from './config/postgres.ts';
import errorMiddleware from './middlewares/errorMiddleware.ts';
import userRouter from './routes/user.route.ts'


const VITE_PORT: number = parseInt(process.env.VITE_PORT!);


const app: Express = express();

 
app.use(express.json());
app.use(cors({
  origin: `http://localhost:${VITE_PORT}`,
}))


app.get("/", (req: Request, res: Response) => {

  return res.send("Hello world");

})

app.use("/users", userRouter);




app.get("/postgres/tables", async(req: Request, res: Response) => {
  
  try{

    const result = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE' AND table_schema = 'public'
      ORDER BY table_schema, table_name;
    `);

    return res.json(result.rows);

  }catch(err){

    console.error("Failed to test postgres", err);
    return res.status(500).json({error: "Error in testing postgres"});

  }
})


app.use(errorMiddleware);


export default app;
