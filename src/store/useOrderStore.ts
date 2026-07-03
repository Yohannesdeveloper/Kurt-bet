import { create } from "zustand";
import type { OrderWithItems } from "@/types";

interface OrderStore {
  orders: OrderWithItems[];
  activeOrder: OrderWithItems | null;
  kdsOrders: OrderWithItems[];
  isLoading: boolean;
  setOrders: (orders: OrderWithItems[]) => void;
  setActiveOrder: (order: OrderWithItems | null) => void;
  setKdsOrders: (orders: OrderWithItems[]) => void;
  addOrder: (order: OrderWithItems) => void;
  updateOrder: (orderId: string, updates: Partial<OrderWithItems>) => void;
  removeOrder: (orderId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  activeOrder: null,
  kdsOrders: [],
  isLoading: false,
  setOrders: (orders) => set({ orders }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  setKdsOrders: (orders) => set({ kdsOrders: orders }),
  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
      kdsOrders: state.kdsOrders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, ...updates }
          : state.activeOrder,
    })),
  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
      kdsOrders: state.kdsOrders.filter((o) => o.id !== orderId),
      activeOrder:
        state.activeOrder?.id === orderId ? null : state.activeOrder,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
