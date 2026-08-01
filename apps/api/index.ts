import express , {type Express, type Request, type Response} from 'express'
const app: Express = express();
const PORT = 3000;

app.get("/", (req: Request, res: Result) => {
  res.send("Hello World");
})

app.listen(3000, () => {
  console.log(`Backend is listening on port ${PORT}`)
})
