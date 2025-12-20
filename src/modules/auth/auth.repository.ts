import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, UpdateProfileInput } from "./auth.dto.js";

export const authRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },
  createUser: (data: RegisterInput) => {
    return prisma.user.create({
      data,
    });
  },
  findById: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },
  updateUser: (id: string, data: UpdateProfileInput) => {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
