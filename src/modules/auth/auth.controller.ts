import type {Request, Response} from "express";
import {LoginDto, RegisterDto} from "./auth.dto.js";
import {authService} from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const data = RegisterDto.parse(req.body);
    const user = await authService.register(data);
    return res.status(201).json({
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message ?? "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = LoginDto.parse(req.body);
    const result = await authService.login(data);
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: result.user,
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message ?? "Invalid credentials",
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
};
