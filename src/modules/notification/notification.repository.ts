import type {Prisma} from "@prisma/client";
import {prisma} from "../../lib/prisma.js";

export const notificationRepository = {
  create: (data: Prisma.NotificationCreateInput) => {
    return prisma.notification.create({ data });
  },

  findByUserId: (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: (id: string) => {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  markAsRead: (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },
};
