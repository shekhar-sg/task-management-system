import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/auth.js";
import { LoginDto, RegisterDto, UpdateProfileDto } from "./auth.dto.js";
import { authService } from "./auth.service.js";

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
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);

    return res.status(200).json({
      profile,
      message: "Profile fetched successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message ?? "Failed to fetch profile",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = UpdateProfileDto.parse(req.body);

    const updatedUser = await authService.updateProfile(userId, data);
    return res.status(200).json({
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message ?? "Failed to update profile",
    });
  }
};
