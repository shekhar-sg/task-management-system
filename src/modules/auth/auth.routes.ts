import {Router} from "express";
import {requireAuth} from "../../middlewares/auth.middleware.js";
import {getProfile, login, logout, register, updateProfile} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.post("/logout", requireAuth, logout);

export default router;
