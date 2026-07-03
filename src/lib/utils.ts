import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "ETB"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function getInitials(firstName: string, lastName?: string): string {
  if (!lastName) return firstName.slice(0, 2).toUpperCase();
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const r = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${y}${m}${d}-${r}`;
}

export function generateTicketNumber(): string {
  return `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseJsonSafe<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export function calculateElapsed(startedAt: Date | string): string {
  const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
  const diff = Date.now() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-500",
    PREPARING: "bg-amber-500",
    READY: "bg-green-500",
    SERVED: "bg-purple-500",
    COMPLETED: "bg-gray-500",
    CANCELLED: "bg-red-500",
    DELAYED: "bg-red-600",
    PAUSED: "bg-yellow-500",
    AVAILABLE: "bg-green-500",
    OCCUPIED: "bg-blue-500",
    RESERVED: "bg-purple-500",
    CLEANING: "bg-yellow-500",
    WAITING_BILL: "bg-orange-500",
    CLOSED: "bg-gray-500",
  };
  return colors[status] || "bg-gray-400";
}

export function getStatusTextColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "text-blue-700 bg-blue-50",
    PREPARING: "text-amber-700 bg-amber-50",
    READY: "text-green-700 bg-green-50",
    SERVED: "text-purple-700 bg-purple-50",
    COMPLETED: "text-gray-700 bg-gray-100",
    CANCELLED: "text-red-700 bg-red-50",
    DELAYED: "text-red-700 bg-red-50",
    PAUSED: "text-yellow-700 bg-yellow-50",
  };
  return colors[status] || "text-gray-700 bg-gray-100";
}
