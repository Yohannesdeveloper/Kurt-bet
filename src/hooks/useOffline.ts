"use client";

import { useState, useEffect } from "react";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (pendingSync.length > 0) {
        navigator.serviceWorker?.ready.then((registration) => {
          (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-orders");
        });
      }
    };
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pendingSync.length]);

  const queueForSync = (data: Record<string, unknown>) => {
    setPendingSync((prev) => [...prev, data]);
    localStorage.setItem("pending-sync", JSON.stringify([...pendingSync, data]));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pending-sync");
      if (stored) {
        try {
          setPendingSync(JSON.parse(stored));
        } catch { /* ignore */ }
      }
    }

    const handleSync = async () => {
      const stored = localStorage.getItem("pending-sync");
      if (!stored) return;
      try {
        const items = JSON.parse(stored);
        if (navigator.onLine && items.length > 0) {
          for (const item of items) {
            try {
              await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              });
            } catch { /* skip failed */ }
          }
          localStorage.removeItem("pending-sync");
          setPendingSync([]);
        }
      } catch { /* ignore */ }
    };

    window.addEventListener("online", handleSync);
    return () => window.removeEventListener("online", handleSync);
  }, []);

  return { isOffline, pendingCount: pendingSync.length, queueForSync };
}
