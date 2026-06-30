"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectSocket(restaurantId: string, branchId?: string, token?: string) {
  const s = getSocket();
  if (s.connected) return s;

  s.auth = { restaurantId, branchId, token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(socket: Socket, room: string) {
  socket.emit("join", { room });
}

export function leaveRoom(socket: Socket, room: string) {
  socket.emit("leave", { room });
}

export function sendOrderUpdate(socket: Socket, data: Record<string, unknown>) {
  socket.emit("order:update", data);
}

export function sendTableUpdate(socket: Socket, data: Record<string, unknown>) {
  socket.emit("table:update", data);
}

export function sendKitchenUpdate(socket: Socket, data: Record<string, unknown>) {
  socket.emit("kitchen:update", data);
}

export function sendNotification(socket: Socket, data: Record<string, unknown>) {
  socket.emit("notification:send", data);
}

export type SocketEventCallback = (data: Record<string, unknown>) => void;

export function onSocketEvent(socket: Socket, event: string, callback: SocketEventCallback) {
  socket.on(event, callback);
  return () => {
    socket.off(event, callback);
  };
}
