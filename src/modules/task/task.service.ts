import {type Prisma, Status} from "@prisma/client";
import {getIO} from "../../socket/index.js";
import {auditService} from "../audit/audit.service.js";
import {notificationService} from "../notification/notification.service.js";
import type {CreateTaskInput, TaskQueryInput, UpdateTaskInput} from "./task.dto.js";
import {taskRepository} from "./task.repository.js";

export const taskService = {
  createTask: async (userId: string, data: CreateTaskInput) => {
    const task = await taskRepository.create({
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

    await auditService.log(userId, task.id, "TASK_CREATED");
    return task;
  },

  updateTask: async (taskId: string, userId: string, data: UpdateTaskInput) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (!canEditTask(task, userId)) {
      throw new Error("Forbidden");
    }
    const { assignedToId, ...rest } = data;
    const updatedTask = await taskRepository.update(taskId, {
      ...rest,
      ...(rest.dueDate && { dueDate: new Date(rest.dueDate) }),
      ...(assignedToId && {
        assignedTo: { connect: { id: assignedToId } },
      }),
      ...(assignedToId === null && {
        assignedTo: { disconnect: true },
      }),
    });

    const io = getIO();
    io.emit("task:updated", updatedTask);

    if (data.status && data.status !== task.status) {
      await auditService.log(userId, taskId, "STATUS_CHANGED", task.status, data.status);
    }

    if (data.priority && data.priority !== task.priority) {
      await auditService.log(userId, taskId, "PRIORITY_CHANGED", task.priority, data.priority);
    }

    if (task.assignedToId !== assignedToId) {
      await auditService.log(
        userId,
        taskId,
        assignedToId ? "ASSIGNED" : "UNASSIGNED",
        assignedToId ?? "UNASSIGNED",
        task.assignedToId ?? "UNASSIGNED"
      );
      if (assignedToId) {
        notificationService
          .createTaskAssignmentNotification(updatedTask.id, assignedToId, updatedTask.title)
          .then(({user:{name}}) => {
            io.to(`user:${assignedToId}`).emit("task:assigned", {
              taskId: updatedTask.id,
              title: updatedTask.title,
              assignedBy: name,
            });
          });
      }
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
    await taskRepository.delete(taskId);
    await auditService.log(userId, taskId, "TASK_DELETED");

    getIO().emit("task:deleted", {
      id: taskId,
      deleted: true,
    });

    return true;
  },

  getTaskById: async (taskId: string) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },

  listTasks: async (userid: string, filters: TaskQueryInput) => {
    const where: Prisma.TaskWhereInput = {};
    if (filters.view?.length) {
      const viewConditions: Prisma.TaskWhereInput[] = [];
      if (filters.view.includes("CREATED")) {
        viewConditions.push({ creatorId: userid });
      }
      if (filters.view.includes("ASSIGNED")) {
        viewConditions.push({ assignedToId: userid });
      }
      if (viewConditions.length) {
        where.OR = viewConditions;
      }
      if (!where.OR?.length) delete where.OR;
    }
    if (filters.priority?.length) {
      where.priority = { in: filters.priority };
    }
    if (filters.status?.length) {
      where.status = { in: filters.status };
    }
    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: Status.COMPLETED };
      // if (typeof where.status === "object" && where.status !== null) {
      //   where.status = (where.status as object)
      //     ? { ...where.status, not: Status.COMPLETED }
      //     : { not: Status.COMPLETED };
      // }
    }
    const orderBy = filters.sortByDueDate ? { dueDate: filters.sortByDueDate } : undefined;

    return taskRepository.findMany(where, orderBy);
  },
};

const canEditTask = (
  task: { creatorId: string; assignedToId: string | null },
  userId: string
): boolean => {
  return task.creatorId === userId || task.assignedToId === userId;
};
