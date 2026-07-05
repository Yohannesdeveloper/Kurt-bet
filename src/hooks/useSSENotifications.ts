"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";

export function useSSENotifications() {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
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
