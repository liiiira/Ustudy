import express, {type Express, type Request, type Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.ts';
import apiRouter from './api.ts';
import cookieParser from 'cookie-parser'

const VITE_PORT: number = parseInt(process.env.VITE_PORT!);


const app: Express = express();

 
app.use(express.json());
app.use(cors({
  origin: `http://localhost:5173`,
  credentials: true
}))
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use("/api/v1", apiRouter);

app.use(errorMiddleware);


export default app;
