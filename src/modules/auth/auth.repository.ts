import {prisma} from "../../lib/prisma.js";
import type {RegisterInput} from "./auth.dto.js";

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
};
