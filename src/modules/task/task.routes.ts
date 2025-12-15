import {Router} from "express";
import {requireAuth} from "../../middlewares/auth.middleware.js";
import {createTask, deleteTask, getTaskById, listTasks, updateTask} from "./task.controller.js";

const router = Router();

router.post("/", requireAuth, createTask);
router.get("/", requireAuth, listTasks);
router.get("/:id", requireAuth, getTaskById);
router.patch("/:id", requireAuth, updateTask);
router.delete("/:id", requireAuth, deleteTask);

export default router;
