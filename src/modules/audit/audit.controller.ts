import type { Response } from "express";
import type { AuthRequest } from "../../types/auth.js";
import { auditService } from "./audit.service.js";

export const getTaskAuditLogs = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const logs = await auditService.getTaskAuditLog(taskId);
  return res.status(200).json(logs);
};
