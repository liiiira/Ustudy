import {Router, type Request, type Response} from 'express';
import pool from './config/postgres.ts';
import userRouter from './features/users/user.route.ts'
import authRouter from './features/auth/auth.route.ts';

const router = Router();
 

router.get("/", (_req: Request, res: Response) => {

  return res.send("Hello world");

})

router.use("/users", userRouter);
router.use("/auth", authRouter);

router.get("/postgres/tables", async(_req: Request, res: Response) => {
  
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

export default router;
