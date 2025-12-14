import express, {type Express, type Request, type Response} from "express";
import morgan from "morgan";

const port = process.env.PORT || 5000;
const app: Express = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.send("initial setup with dependencies and formatter");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
