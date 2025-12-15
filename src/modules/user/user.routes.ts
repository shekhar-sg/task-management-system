import {Router} from "express";
import {requireAuth} from "../../middlewares/auth.middleware.js";
import {getUsers} from "./user.controller.js";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/me", requireAuth, getUsers);

export default router;
