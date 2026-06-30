"use client";

import { useEffect, useState } from "react";
import { WifiOff, CloudOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkSync = () => {
      const stored = localStorage.getItem("pending-sync");
      setPendingCount(stored ? JSON.parse(stored).length : 0);
    };

    checkSync();
    window.addEventListener("storage", checkSync);
    const interval = setInterval(checkSync, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", checkSync);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium
      ${isOffline ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"}`}>
      {isOffline ? (
        <><WifiOff className="h-4 w-4" /> You are offline</>
      ) : (
        <><CloudOff className="h-4 w-4" /> {pendingCount} pending sync</>
      )}
    </div>
  );
}
