import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { prisma } from "@/lib/prisma";

let io: Server | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use(async (socket, next) => {
    const { restaurantId, branchId, token } = socket.handshake.auth;
    if (!restaurantId) {
      return next(new Error("Authentication required"));
    }
    (socket as unknown as Record<string, unknown>).restaurantId = restaurantId;
    (socket as unknown as Record<string, unknown>).branchId = branchId;
    next();
  });

  io.on("connection", (socket) => {
    const restaurantId = (socket as unknown as Record<string, unknown>).restaurantId as string;
    const branchId = (socket as unknown as Record<string, unknown>).branchId as string | undefined;

    const restaurantRoom = `restaurant:${restaurantId}`;
    const branchRoom = branchId ? `branch:${branchId}` : null;

    socket.join(restaurantRoom);
    if (branchRoom) socket.join(branchRoom);

    socket.on("join", ({ room }: { room: string }) => {
      socket.join(room);
    });

    socket.on("leave", ({ room }: { room: string }) => {
      socket.leave(room);
    });

    socket.on("order:update", (data: Record<string, unknown>) => {
      io?.to(restaurantRoom).emit("order:updated", data);
      io?.to("kds").emit("kds:sync", data);
    });

    socket.on("table:update", (data: Record<string, unknown>) => {
      io?.to(restaurantRoom).emit("table:updated", data);
    });

    socket.on("kitchen:update", (data: Record<string, unknown>) => {
      io?.to(restaurantRoom).emit("kitchen:updated", data);
      if (data.status === "READY") {
        io?.to(restaurantRoom).emit("notification:new", {
          notification: {
            type: "ORDER_READY",
            title: "Order Ready",
            message: `Order #${data.orderNumber} is ready to serve`,
            data,
          },
        });
      }
    });

    socket.on("notification:send", (data: Record<string, unknown>) => {
      io?.to(restaurantRoom).emit("notification:new", data);
    });

    socket.on("disconnect", () => {
      socket.leave(restaurantRoom);
      if (branchRoom) socket.leave(branchRoom);
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
