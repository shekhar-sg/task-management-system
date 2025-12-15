import type {Response} from "express";
import type {AuthRequest} from "../../types/auth.js";
import {userService} from "./user.service.js";

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await userService.getMe(userId);
    return res.status(200).json(user);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
