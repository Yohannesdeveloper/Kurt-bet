import { EventEmitter } from "events";

const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(100);

export const NOTIFY_ORDER_READY = "order:ready";

export function emitOrderReady(restaurantId: string, data: { orderId: string; orderNumber: number }) {
  notificationEmitter.emit(`${NOTIFY_ORDER_READY}:${restaurantId}`, data);
}

export function onOrderReady(restaurantId: string, callback: (data: { orderId: string; orderNumber: number }) => void) {
  notificationEmitter.on(`${NOTIFY_ORDER_READY}:${restaurantId}`, callback);
  return () => {
    notificationEmitter.off(`${NOTIFY_ORDER_READY}:${restaurantId}`, callback);
  };
}

export default notificationEmitter;
