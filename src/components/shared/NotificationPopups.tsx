"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useNotificationStore } from "@/store/useNotificationStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function NotificationPopups() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const isWaiter = role === "WAITER";
  const notifications = useNotificationStore((s) => s.notifications);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    if (!isWaiter || notifications.length === 0) return;
    notifications.forEach((n) => {
      if (knownIds.current.has(n.id)) return;
      knownIds.current.add(n.id);
      if (n.isRead) return;

      const sound = new Audio("/sounds/notification.mp3");
      sound.volume = 0.3;
      sound.play().catch(() => {});

      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            onClick={() => {
              toast.dismiss(t.id);
              if (n.actionUrl) {
                window.location.href = n.actionUrl;
              }
            }}
            className="flex items-start gap-3 p-4 rounded-xl shadow-lg border cursor-pointer bg-white border-ethiopian-gold/20 max-w-sm"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ethiopian-coffee">{n.title}</p>
              <p className="text-xs text-ethiopian-coffee/70 mt-0.5 line-clamp-2">{n.message}</p>
              <p className="text-[10px] text-ethiopian-coffee/40 mt-1">{formatRelativeTime(n.createdAt)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="h-5 w-5 rounded-full flex items-center justify-center text-ethiopian-coffee/40 hover:text-ethiopian-coffee hover:bg-ethiopian-cream transition-colors flex-shrink-0"
            >
              ×
            </button>
          </motion.div>
        ),
        { duration: 5000, position: "top-right" }
      );
    });
  }, [notifications]);

  return null;
}
