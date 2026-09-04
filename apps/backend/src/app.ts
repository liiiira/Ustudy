import express, {type Express, type Request, type Response} from 'express';
import 'dotenv/config';
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.ts';
import apiRouter from './api.ts';
import cookieParser from 'cookie-parser'

const VITE_PORT: number = parseInt(process.env.VITE_PORT!);


const app: Express = express();

// pars json
app.use(express.json());

// allow fronted to access backend api and include cookies in requests
app.use(cors({
  origin: `http://localhost:${VITE_PORT}`,
  credentials: true
}))

//use signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET))

//current api path stats with /api/v1
app.use("/api/v1", apiRouter);

// error middlware 
app.use(errorMiddleware);


export default app;
