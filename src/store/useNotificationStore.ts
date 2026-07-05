import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationItem } from "@/types";

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
      addNotification: (notification) =>
        set((state) => {
          if (state.notifications.some((n) => n.id === notification.id)) return state;
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
          };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: "notifications-storage",
      partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<NotificationStore>),
        notifications: (persisted as any).notifications?.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })) ?? [],
      }),
    }
  )
);
