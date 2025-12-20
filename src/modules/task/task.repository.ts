import type { Prisma, Task } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const creatorSelect = {
  select: { name: true, id: true, email: true },
};
const assignedToSelect = {
  select: { name: true, id: true, email: true },
};

export const taskRepository = {
  create: (data: Prisma.TaskCreateInput): Promise<Task> => {
    return prisma.task.create({
      data,
      include: {
        creator: creatorSelect,
        assignedTo: assignedToSelect,
      },
    });
  },
  findById: (id: string): Promise<Task | null> => {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: creatorSelect,
        assignedTo: assignedToSelect,
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
        creator: creatorSelect,
        assignedTo: assignedToSelect,
      },
      orderBy,
    });
  },
  update: (id: string, data: Prisma.TaskUpdateInput): Promise<Task> => {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        creator: creatorSelect,
        assignedTo: assignedToSelect,
      },
    });
  },
  delete: (id: string): Promise<Task> => {
    return prisma.task.delete({
      where: { id },
      include: {
        creator: creatorSelect,
        assignedTo: assignedToSelect,
      },
    });
  },
};
