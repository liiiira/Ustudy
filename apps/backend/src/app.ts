import express, {type Express, type Request, type Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.ts';
import apiRouter from './api.ts';

const VITE_PORT: number = parseInt(process.env.VITE_PORT!);


const app: Express = express();

 
app.use(express.json());
app.use(cors({
  origin: `http://localhost:${VITE_PORT}`,
}))

app.use("/api/v1", apiRouter);

app.use(errorMiddleware);


export default app;
