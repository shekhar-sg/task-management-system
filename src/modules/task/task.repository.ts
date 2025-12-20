import type { Prisma, Task } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export const taskRepository = {
  create: (data: Prisma.TaskCreateInput): Promise<Task> => {
    return prisma.task.create({ data });
  },
  findById: (id: string): Promise<Task | null> => {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: true,
        assignedTo: true,
      },
    });
  },
  findMany: (
    where: Prisma.TaskWhereInput,
    orderBy?: Prisma.TaskOrderByWithRelationInput
  ): Promise<Task[]> => {
    return prisma.task.findMany({
      where,
      include: {
        creator: {
          select: { name: true },
        },
      },
      orderBy,
    });
  },
  update: (id: string, data: Prisma.TaskUpdateInput): Promise<Task> => {
    return prisma.task.update({
      where: { id },
      data,
    });
  },
  delete: (id: string): Promise<Task> => {
    return prisma.task.delete({
      where: { id },
    });
  },
};
