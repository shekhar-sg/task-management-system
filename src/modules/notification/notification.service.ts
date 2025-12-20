import { notificationRepository } from "./notification.repository.js";

export const notificationService = {
  createTaskAssignmentNotification: async (taskId: string, userId: string, taskTitle: string) => {
    return notificationRepository.create({
      user: { connect: { id: userId } },
      task: { connect: { id: taskId } },
      message: `You have been assigned a new task: ${taskTitle}`,
      type: "TASK_ASSIGNED",
    });
  },

  markAsRead: async (notificationId: string, userId: string) => {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Forbidden");

    return notificationRepository.markAsRead(notificationId);
  },

  getUserNotifications: async (userId: string) => {
    return notificationRepository.findByUserId(userId);
  },
};
