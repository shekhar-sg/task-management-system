import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { type Express } from "express";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import { initSocket } from "./socket/index.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app: Express = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

const server = createServer(app);
initSocket(server);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
