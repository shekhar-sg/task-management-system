import {type Prisma, Status} from "@prisma/client";
import type {CreateTaskInput, TaskQueryInput, UpdateTaskInput} from "./task.dto.js";
import {taskRepository} from "./task.repository.js";
import {getIO} from "../../socket/index.js";
import {notificationService} from "../notification/notification.service.js";

export const taskService = {
  createTask: async (userId: string, data: CreateTaskInput) => {
    return taskRepository.create({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      creator: {
        connect: { id: userId },
      },
      ...(data.assignedToId && {
        assignedTo: {
          connect: {
            id: data.assignedToId,
          },
        },
      }),
    });
  },

  getTaskById: async (taskId: string) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },

  listTasks: async (userid: string, filters: TaskQueryInput) => {
    const baseWhere: Prisma.TaskWhereInput = {};
    if (filters.view === "CREATED") {
      baseWhere.creatorId = userid;
    } else if (filters.view === "ASSIGNED") {
      baseWhere.assignedToId = userid;
    } else {
      baseWhere.OR = [{ creatorId: userid }, { assignedToId: userid }];
    }
    const where: Prisma.TaskWhereInput = {
      ...baseWhere,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.overdue && {
        dueDate: { lt: new Date() },
        status: { not: Status.COMPLETED },
      }),
    };
    const orderBy = filters.sortByDueDate ? { dueDate: filters.sortByDueDate } : undefined;

    return taskRepository.findMany(where, orderBy);
  },

  updateTask: async (taskId: string, userId: string, data: UpdateTaskInput) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (!canEditTask(task, userId)) {
      throw new Error("Forbidden");
    }
    const updatedTask = await taskRepository.update(taskId, {
      ...data,
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.assignedToId && {
        assignedTo: { connect: { id: data.assignedToId } },
      }),
      ...(data.assignedToId === null && {
        assignedTo: { disconnect: true },
      }),
    });

    const io = getIO();
    io.emit("task:updated", updatedTask);

    if (data.assignedToId && task.assignedToId !== data.assignedToId) {
      io.to(`user:${data.assignedToId}`).emit("task:assigned", {
        taskId: updatedTask.id,
        title: updatedTask.title,
      });

      await notificationService.createTaskAssignmentNotification(
        updatedTask.id,
        data.assignedToId,
        updatedTask.title
      );
    }

    return updatedTask;
  },

  deleteTask: async (taskId: string, userId: string) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.creatorId !== userId) {
      throw new Error("Forbidden");
    }
    return taskRepository.delete(taskId);
  },
};

const canEditTask = (
  task: { creatorId: string; assignedToId: string | null },
  userId: string
): boolean => {
  return task.creatorId === userId || task.assignedToId === userId;
};
