"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";

export function useSSENotifications() {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const { notifications, addNotification } = useNotificationStore.getState();

    fetch("/api/orders?status=READY")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const existingIds = new Set(
            notifications
              .filter((n) => n.data?.orderId)
              .map((n) => n.data!.orderId)
          );
          (res.data as any[]).forEach((order) => {
            if (!existingIds.has(order.id)) {
              addNotification({
                id: `order-ready-${order.id}`,
                type: "ORDER_READY",
                title: "Order Ready",
                message: `Order #${order.orderNumber} is ready to serve`,
                data: { orderId: order.id, orderNumber: order.orderNumber },
                isRead: false,
                actionUrl: "/orders",
                createdAt: new Date(order.updatedAt || order.createdAt),
              });
            }
          });
        }
      })
      .catch(() => {});

    let es: EventSource;

    const connect = () => {
      es = new EventSource("/api/notifications/stream");
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ORDER_READY") {
            useNotificationStore.getState().addNotification({
              id: `order-ready-${data.orderId}`,
              type: "ORDER_READY",
              title: "Order Ready",
              message: `Order #${data.orderNumber} is ready to serve`,
              data: { orderId: data.orderId, orderNumber: data.orderNumber },
              isRead: false,
              actionUrl: "/orders",
              createdAt: new Date(),
            });
          } else if (data.type === "KURT_PICKUP_READY") {
            useNotificationStore.getState().addNotification({
              id: `kurt-pickup-${data.orderId}`,
              type: "KURT_PICKUP_READY",
              title: "Qurt Ready for Pickup",
              message: `Qurt order #${data.orderNumber}${data.tableNumber ? ` (Table ${data.tableNumber})` : ""} — ${data.menuItemName} is ready. Pick up from butcher!`,
              data: { orderId: data.orderId, orderNumber: data.orderNumber, menuItemName: data.menuItemName, tableNumber: data.tableNumber },
              isRead: false,
              actionUrl: "/dashboard/waiter",
              createdAt: new Date(),
            });
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);
}
