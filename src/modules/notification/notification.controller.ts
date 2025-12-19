import type {Response} from "express";
import type {AuthRequest} from "../../types/auth.js";
import {notificationService} from "./notification.service.js";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);
    return res.status(200).json({
      message: "MarkAsRead successfully",
      notification,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Notification not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Forbidden") {
        return res.status(403).json({ message: error.message });
      }
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
