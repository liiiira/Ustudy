import express, { type Express } from "express";
import "dotenv/config";
import cors from "cors";
import errorMiddleware from "./middlewares/errorMiddleware.ts";
import apiRouter from "./api.ts";
import cookieParser from "cookie-parser";

const VITE_PORT: number = parseInt(process.env.VITE_PORT!);

const app: Express = express();

// pars json
app.use(express.json());

// allow fronted to access backend api and include cookies in requests
app.use(
  cors({
    origin: `http://localhost:${VITE_PORT}`,
    credentials: true,
  }),
);

//use signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// claculate duration of each request
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`,
    );
  });
  next();
});

//current api path stats with /api/v1
app.use("/api/v1", apiRouter);

// error middlware
app.use(errorMiddleware);

export default app;
