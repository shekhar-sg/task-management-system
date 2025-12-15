import {Router} from "express";
import {requireAuth} from "../../middlewares/auth.middleware.js";
import {getMyNotifications, markAsRead} from "./notification.controller.js";

const router = Router();

router.get("/", requireAuth, getMyNotifications);
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
