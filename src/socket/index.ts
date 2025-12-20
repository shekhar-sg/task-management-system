import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

interface SocketUserPayload {
  userID: string;
}

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });
  io.use((socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) return next(new Error("Unauthorized"));
      const token = cookie
        .split("; ")
        .find((c) => c.startsWith("access_token="))
        ?.split("=")[1];

      if (!token) return next(new Error("Unauthorized"));

      socket.data.user = jwt.verify(token, process.env.JWT_SECRET!) as SocketUserPayload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUserPayload;
    const room = `user:${user.userID}`;
    socket.join(room);
    console.log(`user ${user.userID} connected`);
    socket.on("disconnect", () => {
      console.log(`user ${user.userID} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
