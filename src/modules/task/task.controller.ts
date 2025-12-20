import type { Response } from "express";
import { ZodError } from "zod";
import type { AuthRequest } from "../../types/auth.js";
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from "./task.dto.js";
import { taskService } from "./task.service.js";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = CreateTaskDto.parse(req.body);
    const task = await taskService.createTask(userId, data);
    return res.status(201).send({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    return res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

export const listTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { searchParams } = new URL(req.originalUrl, `http://${req.headers.host}`);
    const requestParams = Object.fromEntries(searchParams.entries());
    const filters = TaskQueryDto.parse(requestParams);
    console.log({ requestParams, filters });
    const tasks = await taskService.listTasks(userId, filters);
    return res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = UpdateTaskDto.parse(req.body);
    const updatedTask = await taskService.updateTask(id, userId, data);
    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await taskService.deleteTask(id, userId);
    return res.status(204).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errors: error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (error instanceof Error) {
    if (error.message === "Forbidden") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (error.message === "Task not found") {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};
