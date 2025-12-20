import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Express } from "express";
import auditRoutes from "./modules/audit/audit.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import {initSocket} from "./socket/index.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app: Express = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/users", userRoutes);

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
