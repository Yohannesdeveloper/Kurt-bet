"use client";

import { useEffect, useRef, useCallback } from "react";
import { getSocket, connectSocket, disconnectSocket, onSocketEvent } from "@/lib/socket";
import { useOrderStore } from "@/store/useOrderStore";
import { useTableStore } from "@/store/useTableStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useSession } from "next-auth/react";

export function useSocket() {
  const { data: session } = useSession();
  const connected = useRef(false);
  const addOrder = useOrderStore((s) => s.addOrder);
  const updateOrder = useOrderStore((s) => s.updateOrder);
  const removeOrder = useOrderStore((s) => s.removeOrder);
  const setKdsOrders = useOrderStore((s) => s.setKdsOrders);
  const updateTable = useTableStore((s) => s.updateTable);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const connect = useCallback(() => {
    if (!session?.user) return;
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    const branchId = (session.user as { branchId?: string }).branchId;
    if (!restaurantId || connected.current) return;

    const socket = connectSocket(restaurantId, branchId);

    socket.on("connect", () => {
      connected.current = true;
    });

    onSocketEvent(socket, "order:new", (data) => {
      if (data.order) addOrder(data.order as never);
    });

    onSocketEvent(socket, "order:updated", (data) => {
      if (data.orderId && data.updates) {
        updateOrder(data.orderId as string, data.updates as never);
      }
    });

    onSocketEvent(socket, "order:removed", (data) => {
      if (data.orderId) removeOrder(data.orderId as string);
    });

    onSocketEvent(socket, "table:updated", (data) => {
      if (data.tableId && data.updates) {
        updateTable(data.tableId as string, data.updates as Partial<Parameters<typeof updateTable>[1]>);
      }
    });

    onSocketEvent(socket, "kds:sync", (data) => {
      if (data.orders) setKdsOrders(data.orders as never);
    });

    onSocketEvent(socket, "notification:new", (data) => {
      if (data.notification) addNotification(data.notification as never);
    });

    return () => {
      disconnectSocket();
      connected.current = false;
    };
  }, [session, addOrder, updateOrder, removeOrder, updateTable, addNotification, setKdsOrders]);

  useEffect(() => {
    if (session?.user) {
      const cleanup = connect();
      return () => {
        cleanup?.();
      };
    }
  }, [session, connect]);

  return { connected: connected.current };
}
