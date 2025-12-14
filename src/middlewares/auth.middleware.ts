import type {NextFunction, Response} from "express";
import jwt from "jsonwebtoken";
import type {AuthRequest} from "../types/auth.js";

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({
      message: "Authentication token missing",
    });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string };
    req.user = { id: payload.userID };
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }
};
