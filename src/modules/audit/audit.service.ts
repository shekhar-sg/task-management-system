import type { TaskAuditAction } from "@prisma/client";
import { auditRepository } from "./audit.repository.js";

export const auditService = {
  log: async (
    userId: string,
    taskId: string,
    action: TaskAuditAction,
    oldValue?: string,
    newValue?: string
  ) => {
    return auditRepository.create({
      user: { connect: { id: userId } },
      task: { connect: { id: taskId } },
      action,
      oldValue,
      newValue,
    });
  },
  getTaskAuditLog: (taskId: string) => {
    return auditRepository.findByTaskId(taskId);
  },
};
