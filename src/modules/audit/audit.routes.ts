import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { getTaskAuditLogs } from "./audit.controller.js";

const router = Router();

router.get("/tasks/:taskId", requireAuth, getTaskAuditLogs);

export default router;
