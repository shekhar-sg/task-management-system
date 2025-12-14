import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type {LoginInput, RegisterInput} from "./auth.dto.js";
import {authRepository} from "./auth.repository.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
export const authService = {
  register: async (data: RegisterInput) => {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(`User already exists`);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      ...data,
      password: hashedPassword,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  login: async (data: LoginInput) => {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error(`Invalid email or password`);
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error(`Invalid email or password`);
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "5d" });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
};
