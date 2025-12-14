import {Router} from "express";
import {requireAuth} from "../../middlewares/auth.middleware.js";
import {login, logout, register} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);

export default router;
