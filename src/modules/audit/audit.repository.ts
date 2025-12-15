import type {Prisma} from "@prisma/client";
import {prisma} from "../../lib/prisma.js";

export const auditRepository = {
  create: (data: Prisma.AuditLogCreateInput) => {
    return prisma.auditLog.create({
      data,
    });
  },

  findByTaskId: (taskId: string) => {
    return prisma.auditLog.findMany({
      where: { taskId },
      orderBy: { timestamp: "desc" },
    });
  },
};
