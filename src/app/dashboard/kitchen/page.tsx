"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, CheckCircle, AlertCircle, Flame, Timer, CookingPot, Beef, Check, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const dishImages: Record<string, string> = {
  Tibs: "/images/tibs.jpg", Kurt: "/images/kurt.jpg", Kitfo: "/images/kifo.jpg",
  Dulet: "/images/kurt.jpg", "Tere Sega": "/images/gored gored.jpg", "Gored Gored": "/images/gored gored.jpg",
};
const dishColors: Record<string, string> = {
  Tibs: "bg-red-600", Kurt: "bg-amber-700", Kitfo: "bg-orange-600",
  Dulet: "bg-emerald-700", "Tere Sega": "bg-rose-700", "Gored Gored": "bg-purple-700",
};
function DishThumb({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconDim = size === "sm" ? "text-lg" : "text-xl";
  const color = dishColors[name] || "bg-gray-600";
  const src = dishImages[name] || "/images/kurt.jpg";
  const [err, setErr] = useState(false);
  return (
    <div className={`${dim} rounded-xl overflow-hidden flex-shrink-0 border border-ethiopian-gold/10 shadow-sm relative`}>
      {!err && <img src={src} alt={name} className="w-full h-full object-cover absolute inset-0" onError={() => setErr(true)} />}
      <div className={`w-full h-full ${err ? "flex" : "hidden"} items-center justify-center ${color} text-white font-bold ${iconDim}`}>
        {name.charAt(0)}
      </div>
    </div>
  );
}

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  meatType: string;
  menuItemName: string;
  weight: number;
  quantity: number;
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  kitchenStatus: "WAITING" | "RECEIVED";
  createdAt: string;
  approvedAt: string | null;
};

const STATUS_ORDER = ["NEW", "PREPARING", "READY", "SERVED"];

const statsConfig = {
  NEW:       { label: "Pending Orders",   value: "0", icon: Clock,       color: "from-amber-500 to-orange-600",    bgColor: "bg-amber-500/10",  iconColor: "text-amber-600" },
  PREPARING: { label: "In Progress",      value: "0", icon: Flame,       color: "from-orange-500 to-red-600",     bgColor: "bg-orange-500/10",  iconColor: "text-orange-600" },
  READY:     { label: "Ready to Serve",   value: "0", icon: CheckCircle, color: "from-ethiopian-gold to-ethiopian-coffee",  bgColor: "bg-ethiopian-gold/10", iconColor: "text-ethiopian-gold" },
  SERVED:    { label: "Served Today",     value: "0", icon: Timer,       color: "from-blue-500 to-cyan-600",     bgColor: "bg-blue-500/10",   iconColor: "text-blue-600" },
  BUTCHER:   { label: "Butcher Orders",  value: "0", icon: Beef,        color: "from-ethiopian-burgundy to-ethiopian-gold",  bgColor: "bg-red-500/10",   iconColor: "text-ethiopian-burgundy" },
};

export default function KitchenDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  console.log("KITCHEN DASHBOARD MOUNTED - v3");
  const { t } = useTranslation();
  const statusLabels: Record<string, string> = {
    NEW: t("orders.pending"),
    PREPARING: t("orders.preparing"),
    READY: t("orders.ready"),
    SERVED: t("orders.delivered"),
    BUTCHER: t("dashboard.butcherOrders"),
  };
  const [counts, setCounts] = useState<Record<string, number>>({ NEW: 0, PREPARING: 0, READY: 0, SERVED: 0 });
  const [butcherOrders, setButcherOrders] = useState<ButcherOrder[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localReceivedOrders, setLocalReceivedOrders] = useState<ButcherOrder[]>([]);

  const deleteButcherOrder = async (id: string) => {
    if (!confirm("Delete this butcher order?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/butcher-orders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Butcher order deleted");
        setButcherOrders(prev => prev.filter(o => o.id !== id));
        setLocalReceivedOrders(prev => prev.filter(o => o.id !== id));
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const doFetch = useCallback(() => {
    fetch("/api/orders?status=NEW,PREPARING,READY,SERVED")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const c: Record<string, number> = { NEW: 0, PREPARING: 0, READY: 0, SERVED: 0 };
          d.data.forEach((o: any) => { if (c[o.status] !== undefined) c[o.status]++; });
          setCounts(c);
        }
      })
      .catch(() => {});
    fetch("/api/butcher-orders?status=APPROVED")
      .then(r => r.json())
      .then(d => { if (d.success) setButcherOrders(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    doFetch();
    const interval = setInterval(doFetch, 5000);
    return () => clearInterval(interval);
  }, [doFetch]);

  const markAsReceived = async (id: string) => {
    console.log("markAsReceived called with id:", id);
    console.log("butcherOrders before:", butcherOrders);
    console.log("localReceivedOrders before:", localReceivedOrders);
    setActionLoading(id);
    const order = butcherOrders.find(o => o.id === id);
    console.log("found order:", order);
    if (order) {
      const receivedOrder = { ...order, kitchenStatus: "RECEIVED" as const };
      console.log("adding to localReceivedOrders:", receivedOrder);
      setLocalReceivedOrders(prev => {
        const next = [...prev, receivedOrder];
        console.log("localReceivedOrders after update:", next);
        return next;
      });
    }
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kitchenStatus: "RECEIVED" }),
      });
      const data = await res.json();
      console.log("PATCH response:", data);
      if (data.success) {
        toast.success(`Butcher order marked as received`);
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const isKurtOrder = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("kurt") || lower.includes("qurt") || lower.includes("ቁርጥ");
  };

  const waitingOrders = butcherOrders.filter(o => o.kitchenStatus === "WAITING" && !isKurtOrder(o.menuItemName) && !localReceivedOrders.some(r => r.id === o.id));
  const receivedOrders = [
    ...localReceivedOrders.filter(o => !isKurtOrder(o.menuItemName)),
    ...butcherOrders.filter(o => o.kitchenStatus === "RECEIVED" && !isKurtOrder(o.menuItemName) && !localReceivedOrders.some(r => r.id === o.id)),
  ];
  const total = Object.values(counts).reduce((a, b) => a + b, 0) + butcherOrders.length;
  const newTotal = counts.NEW + receivedOrders.length;

  console.log("RENDER - butcherOrders:", butcherOrders);
  console.log("RENDER - localReceivedOrders:", localReceivedOrders);
  console.log("RENDER - waitingOrders:", waitingOrders);
  console.log("RENDER - receivedOrders:", receivedOrders);
  console.log("RENDER - total:", total);
  console.log("RENDER - newTotal:", newTotal);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-ethiopian-coffee dark:text-ethiopian-cream">
            {t("nav.kitchen")} Dashboard
          </h1>
          <p className="text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 mt-1">Manage incoming orders and kitchen queue</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-300">v3</span>
          <div className="h-2 w-2 rounded-full bg-ethiopian-gold animate-pulse" />
          <ChefHat className="h-5 w-5 text-ethiopian-gold" />
          <span className="text-sm font-medium text-ethiopian-coffee dark:text-ethiopian-cream">{total} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {STATUS_ORDER.map((status, index) => {
          const s = statsConfig[status as keyof typeof statsConfig];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-ethiopian-gold/10 hover:border-ethiopian-gold/20">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl ${s.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <s.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${s.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-xs lg:text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 font-medium mb-1">{statusLabels[status]}</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight text-ethiopian-coffee dark:text-ethiopian-cream">{counts[status]}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-ethiopian-gold/10 hover:border-ethiopian-burgundy/30">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Beef className="h-5 w-5 lg:h-6 lg:w-6 text-ethiopian-burgundy" />
                </div>
              </div>
              <p className="text-xs lg:text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 font-medium mb-1">{t("dashboard.butcherOrders")}</p>
              <p className="text-2xl lg:text-3xl font-bold tracking-tight text-ethiopian-coffee dark:text-ethiopian-cream">{waitingOrders.length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Butcher Orders - Awaiting Receipt */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif text-ethiopian-coffee dark:text-ethiopian-cream">Butcher Orders</h2>
          <span className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">In New Orders: {localReceivedOrders.length}</span>
        </div>
        {waitingOrders.length === 0 ? (
          <div className="text-center py-6 text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 bg-white dark:bg-gray-950 rounded-2xl shadow-md border border-ethiopian-gold/10">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm">All butcher orders received</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {waitingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-950 rounded-2xl shadow-md border border-ethiopian-gold/10 hover:shadow-xl hover:border-ethiopian-gold/20 transition-all duration-300 p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <DishThumb name={order.menuItemName} />
                    <span className="text-lg font-bold text-ethiopian-coffee dark:text-ethiopian-cream">#{order.orderNumber}</span>
                    {order.tableNumber && (
                      <span className="text-sm font-semibold text-ethiopian-gold">Table {order.tableNumber}</span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                      Waiting
                    </span>
                    <span className="text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {order.approvedAt ? new Date(order.approvedAt).toLocaleString() : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20 dark:bg-gray-800/50">
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">Meat Type</p>
                      <p className="text-sm font-bold text-ethiopian-burgundy dark:text-red-400">{order.meatType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">Dish</p>
                      <p className="text-sm font-semibold text-ethiopian-coffee dark:text-ethiopian-cream">{order.menuItemName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">Weight</p>
                      <p className="text-sm font-bold text-ethiopian-gold">{order.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">Quantity</p>
                      <p className="text-sm font-semibold text-ethiopian-coffee dark:text-ethiopian-cream">x{order.quantity}</p>
                    </div>
                    {order.notes && (
                      <div className="col-span-2 sm:col-span-4">
                        <p className="text-xs text-ethiopian-coffee/40 dark:text-ethiopian-cream/40">Notes</p>
                        <p className="text-sm italic text-ethiopian-coffee/70 dark:text-ethiopian-cream/70">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { console.log("BUTTON CLICKED", order.id); markAsReceived(order.id); }}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {actionLoading === order.id ? "Marking..." : "Mark as Received"}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => deleteButcherOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all disabled:opacity-50 text-sm font-medium"
                        title="Delete order"
                      >
                        {actionLoading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-ethiopian-coffee dark:text-ethiopian-cream">
              <AlertCircle className="h-5 w-5 text-ethiopian-gold" />
              Order Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {STATUS_ORDER.map((status) => {
                const colors: Record<string, string> = { NEW: "bg-amber-500", PREPARING: "bg-blue-500", READY: "bg-orange-500", SERVED: "bg-green-500" };
                const labels: Record<string, string> = { NEW: t("orders.pending"), PREPARING: t("orders.preparing"), READY: t("orders.ready"), SERVED: t("orders.delivered") };
                const count = status === "NEW" ? newTotal : counts[status];
                return (
                  <div key={status} className="text-center">
                    <div className={`h-12 w-12 rounded-full ${colors[status]} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <span className="text-white font-bold text-lg">{count}</span>
                    </div>
                    <p className="text-sm font-medium text-ethiopian-coffee dark:text-ethiopian-cream">{labels[status]}</p>
                  </div>
                );
              })}
            </div>
            {total === 0 && receivedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-ethiopian-coffee/60 dark:text-ethiopian-cream/60">
                <ChefHat className="h-16 w-16 mb-4 opacity-30 text-ethiopian-coffee dark:text-ethiopian-cream" />
                <p className="font-medium mb-1 text-ethiopian-coffee dark:text-ethiopian-cream">No orders in queue</p>
                <p className="text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60">New orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedOrders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 uppercase tracking-wider">New Orders</p>
                    {receivedOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
                        <DishThumb name={order.menuItemName} size="sm" />
                        <Beef className="w-4 h-4 text-ethiopian-burgundy flex-shrink-0" />
                        <span className="text-sm font-semibold text-ethiopian-coffee dark:text-ethiopian-cream">#{order.orderNumber} {order.menuItemName}</span>
                        <span className="text-xs text-ethiopian-coffee/60 dark:text-ethiopian-cream/60">{order.meatType} · {order.weight}kg · x{order.quantity}</span>
                        {order.tableNumber && <span className="text-xs font-medium text-ethiopian-gold ml-auto">Table {order.tableNumber}</span>}
                        {isAdmin && (
                          <button
                            onClick={() => deleteButcherOrder(order.id)}
                            disabled={actionLoading === order.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-colors disabled:opacity-50 text-xs font-medium"
                            title="Delete"
                          >
                            {actionLoading === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {STATUS_ORDER.flatMap(status =>
                    Array.from({ length: Math.min(counts[status], 3) }).map((_, i) => (
                      <div key={`${status}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-gray-800/50">
                        <div className={`h-2 w-2 rounded-full ${statsConfig[status as keyof typeof statsConfig].bgColor}`} />
                        <span className="text-sm font-medium text-ethiopian-coffee dark:text-ethiopian-cream">{statusLabels[status]}</span>
                        <span className="text-xs text-ethiopian-coffee/60 dark:text-ethiopian-cream/60 ml-auto">In queue</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <Button className="w-full mt-4" variant="premium" asChild>
              <Link href="/kds">
                <CookingPot className="h-4 w-4 mr-2" />
                Open Kitchen Display System
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}