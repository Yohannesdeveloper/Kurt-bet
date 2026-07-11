"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, CookingPot, Clock, XCircle, ChevronRight, UtensilsCrossed, ChefHat, Beef, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { getSocket, sendKitchenUpdate } from "@/lib/socket";

const dishImages: Record<string, string> = {
  Tibs: "/images/tibs.jpg", Kurt: "/images/kurt.jpg", Kitfo: "/images/kifo.jpg",
  Dulet: "/images/kurt.jpg", "Tere Sega": "/images/gored gored.jpg", "Gored Gored": "/images/gored gored.jpg",
};
const dishColors: Record<string, string> = {
  Tibs: "bg-red-600", Kurt: "bg-amber-700", Kitfo: "bg-orange-600",
  Dulet: "bg-emerald-700", "Tere Sega": "bg-rose-700", "Gored Gored": "bg-purple-700",
};
function DishThumb({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const [err, setErr] = useState(false);
  const dim = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const iconDim = size === "sm" ? "text-base" : "text-lg";
  const color = dishColors[name] || "bg-gray-600";
  const src = dishImages[name] || "/images/kurt.jpg";
  return (
    <div className={`${dim} rounded-lg overflow-hidden flex-shrink-0 border border-ethiopian-gold/10 shadow-sm relative`}>
      {!err && <img src={src} alt={name} className="w-full h-full object-cover absolute inset-0" onError={() => setErr(true)} />}
      <div className={`w-full h-full ${err ? "flex" : "hidden"} items-center justify-center ${color} text-white font-bold ${iconDim}`}>
        {name.charAt(0)}
      </div>
    </div>
  );
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cookingNotes?: string;
  menuItem?: { image?: string } | null;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  type: string;
  tableId?: string;
  guestCount?: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  table?: { number: number; name?: string } | null;
}

const STATUS_FLOW: Record<string, { next: string | null; label: string; color: string; bg: string; border: string; dot: string }> = {
  NEW:       { next: "PREPARING", label: "Pending",       color: "text-ethiopian-gold", bg: "bg-ethiopian-gold/10", border: "border-ethiopian-gold/20", dot: "bg-ethiopian-gold" },
  PREPARING: { next: "READY",     label: "Preparing",     color: "text-ethiopian-gold", bg: "bg-ethiopian-gold/10", border: "border-ethiopian-gold/20", dot: "bg-ethiopian-gold" },
  READY:     { next: "SERVED",    label: "Ready for Pickup", color: "text-ethiopian-clay", bg: "bg-ethiopian-clay/10", border: "border-ethiopian-clay/20", dot: "bg-ethiopian-clay" },
  SERVED:    { next: null,        label: "Served",        color: "text-ethiopian-coffee dark:text-ethiopian-cream", bg: "bg-ethiopian-coffee/10", border: "border-ethiopian-coffee/20", dot: "bg-ethiopian-coffee" },
  CANCELLED: { next: null,        label: "Cancelled",     color: "text-ethiopian-burgundy", bg: "bg-ethiopian-burgundy/10", border: "border-ethiopian-burgundy/20", dot: "bg-ethiopian-burgundy" },
};

const STATUS_ORDER = ["NEW", "PREPARING", "READY", "SERVED"];

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

const OrderCard = memo(function OrderCard({ order, onStatusUpdate, isAdmin }: { order: Order; onStatusUpdate: (id: string, status: string) => void; isAdmin?: boolean }) {
  const { t } = useTranslation();
  const s = STATUS_FLOW[order.status] || STATUS_FLOW.NEW;
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusTLabel: Record<string, string> = {
    NEW: t("orders.pending"),
    PREPARING: t("orders.preparing"),
    READY: t("orders.ready"),
    SERVED: t("orders.delivered"),
    CANCELLED: t("orders.cancelled"),
  };

  const handleStatus = async (newStatus: string) => {
    setUpdating(true);
    onStatusUpdate(order.id, newStatus);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Order #${order.orderNumber} → ${STATUS_FLOW[newStatus]?.label || newStatus}`);
        const socket = getSocket();
        if (socket.connected) {
          sendKitchenUpdate(socket, {
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: newStatus,
          });
        }
      } else {
        toast.error(d.error || "Status update failed");
      }
    } catch {
      toast.error("Status update failed (network)");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
      <Card className={`border-l-4 ${s.border} ${s.bg} shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <span className="font-bold text-base text-ethiopian-coffee dark:text-ethiopian-cream">#{order.orderNumber}</span>
                <Badge variant={order.status === "NEW" ? "premium" : "outline"} className={`text-xs ${s.color}`}>{statusTLabel[order.status]}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-ethiopian-coffee/60 dark:text-ethiopian-cream/70">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(order.createdAt)}</span>
                {order.table && <span className="flex items-center gap-1"><UtensilsCrossed className="h-3 w-3" />Table {order.table.number}</span>}
                {order.guestCount && <span>{order.guestCount} guests</span>}
              </div>
            </div>
            {order.notes && (
              <div className="text-xs text-ethiopian-coffee/50 dark:text-ethiopian-cream/50 max-w-[120px] text-right truncate" title={order.notes}>
                {order.notes}
              </div>
            )}
          </div>

          <div className="space-y-1 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                {item.menuItem?.image && (
                  <img src={item.menuItem.image} alt="" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                )}
                <span className="font-medium text-ethiopian-coffee dark:text-ethiopian-cream"><span className="text-ethiopian-coffee/50 dark:text-ethiopian-cream/50 mr-1">×{item.quantity}</span>{item.name}</span>
                {item.cookingNotes && <span className="text-xs text-ethiopian-coffee/50 dark:text-ethiopian-cream/50 ml-2">({item.cookingNotes})</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-ethiopian-gold/10">
            {s.next && (
              <Button
                size="sm"
                variant="premium"
                disabled={updating}
                onClick={() => handleStatus(s.next!)}
                className="h-8 text-xs gap-1"
              >
                {updating ? "..." : <><ChevronRight className="h-3 w-3" /> {statusTLabel[s.next!]}</>}
              </Button>
            )}
            {order.status !== "CANCELLED" && order.status !== "SERVED" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={updating}
                onClick={() => handleStatus("CANCELLED")}
                className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
              >
                <XCircle className="h-3 w-3 mr-1" />{t("common.cancel")}
              </Button>
            )}
            {isAdmin && order.status === "SERVED" && (
              <button
                onClick={async () => {
                  if (!confirm("Delete this delivered order permanently?")) return;
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
                    const d = await res.json();
                    if (d.success) { toast.success("Order deleted"); onStatusUpdate(order.id, "DELETED"); }
                    else { toast.error(d.error || "Failed"); }
                  } catch { toast.error("Failed"); }
                  setDeleting(false);
                }}
                disabled={deleting}
                className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-medium disabled:opacity-50"
                title="Delete order"
              >
                <Trash2 className="w-3.5 h-3.5" /> {deleting ? "..." : "Delete"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

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

export default function KDSPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  const [orders, setOrders] = useState<Order[]>([]);
  const [butcherOrders, setButcherOrders] = useState<ButcherOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useSocket();

  const fetchOrders = useCallback(() => {
    fetch("/api/orders?status=NEW,PREPARING,READY,SERVED")
      .then(r => r.json())
      .then(d => {
        if (d.success) setOrders(d.data);
      })
      .catch(() => {});
  }, []);

  const fetchButcherOrders = useCallback(() => {
    fetch("/api/butcher-orders?status=APPROVED")
      .then(r => r.json())
      .then(d => {
        if (d.success) setButcherOrders(d.data);
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(() => {
    fetchOrders();
    fetchButcherOrders();
    setLoading(false);
  }, [fetchOrders, fetchButcherOrders]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleButcherReceived = async (bo: ButcherOrder) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DINE_IN",
          tableId: null,
          tableNumber: bo.tableNumber || null,
          guestCount: 1,
          subtotal: 0,
          total: 0,
          skipButcherAutoCreate: true,
          items: [{
            menuItemId: "butcher-item",
            name: bo.menuItemName,
            quantity: bo.quantity,
            unitPrice: 0,
            totalPrice: 0,
          }],
        }),
      });
      const orderData = await res.json();
      if (orderData.success) {
        toast.success(`#${bo.orderNumber} moved to New Orders`);
        setOrders(prev => [orderData.data, ...prev]);
        await fetch(`/api/butcher-orders?id=${encodeURIComponent(bo.id)}`, { method: "DELETE" });
        fetchButcherOrders();
      } else {
        toast.error(orderData.error || "Failed");
      }
    } catch {
      toast.error("Failed to receive order");
    }
  };

  const colLabel: Record<string, string> = {
    NEW: t("kds.newOrders"),
    PREPARING: t("kds.preparing"),
    READY: t("kds.ready"),
    SERVED: t("orders.delivered"),
  };
  const grouped = STATUS_ORDER.map(status => ({
    status,
    label: colLabel[status] || STATUS_FLOW[status]?.label || status,
    color: STATUS_FLOW[status]?.color || "",
    dot: STATUS_FLOW[status]?.dot || "",
    orders: orders.filter(o => o.status === status),
  }));

  const waitingButcherOrders = butcherOrders.filter(b => b.kitchenStatus === "WAITING");
  const hasOrders = orders.length > 0 || waitingButcherOrders.length > 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-ethiopian-charcoal via-black to-ethiopian-coffee">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b border-ethiopian-gold/10 bg-ethiopian-coffee/98 backdrop-blur-2xl shadow-2xl shadow-black/30"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-ethiopian-gold/10 hover:bg-ethiopian-gold/20 transition-all duration-200 border border-ethiopian-gold/20"
          >
            <ArrowLeft className="h-5 w-5 text-ethiopian-gold" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 border border-ethiopian-gold/20">
            <CookingPot className="h-5 w-5 text-ethiopian-gold" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-ethiopian-gold font-serif">{t("kds.title")}</h1>
            <p className="text-xs text-ethiopian-cream/50">{orders.length + waitingButcherOrders.length} orders active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-2 w-2 rounded-full bg-ethiopian-gold" />
          <span className="text-xs text-ethiopian-cream/50">Live</span>
          {isAdmin && (
            <button
              onClick={async () => {
                if (!confirm("Clear all orders from KDS (New, Preparing, Ready, Delivered, Butcher)?")) return;
                try {
                  const res = await fetch("/api/orders/clear-history", { method: "DELETE" });
                  const d = await res.json();
                  if (d.success) { toast.success("All orders cleared"); refresh(); }
                  else { toast.error(d.error || "Failed"); }
                } catch { toast.error("Failed"); }
              }}
              className="ml-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-ethiopian-clay/10 text-ethiopian-clay hover:bg-ethiopian-clay/20 transition-colors text-xs font-medium border border-ethiopian-clay/20"
              title="Clear history"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear history
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-ethiopian-coffee/50 dark:text-ethiopian-cream/70">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-4 h-4 border-2 border-ethiopian-gold/20 border-t-ethiopian-gold rounded-full" />
              <span>{t("common.loading")}</span>
            </div>
          </div>
          ) : !hasOrders ? (
          <div className="flex flex-col items-center justify-center h-full text-ethiopian-cream/50">
            <div className="relative mb-6">
              <ChefHat className="h-20 w-20 opacity-20" />
              <motion.div
                animate={{ scale: [0, 1.5, 0], opacity: [0, 0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-ethiopian-gold/10 rounded-full blur-xl"
              />
            </div>
            <p className="text-lg font-semibold text-ethiopian-cream">{t("orders.pending")}</p>
            <p className="text-sm text-ethiopian-cream/50">{t("orders.noOrders")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-full">
            {grouped.map(grp => (
              <div key={grp.status} className="flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${grp.dot}`} />
                  <h2 className="text-sm font-semibold text-ethiopian-cream/70 uppercase tracking-wider">{grp.label}</h2>
                  <Badge variant="secondary" className="text-xs ml-auto text-ethiopian-cream/70 bg-ethiopian-gold/10">{grp.orders.length}</Badge>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1">
                  <AnimatePresence mode="popLayout">
                    {grp.orders.map(order => (
                      <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} isAdmin={isAdmin} />
                    ))}
                  </AnimatePresence>
                  {grp.orders.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-ethiopian-cream/40 border border-dashed border-ethiopian-gold/10 rounded-xl bg-black/20">
                      {t("orders.noOrders")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="h-2.5 w-2.5 rounded-full bg-ethiopian-clay" />
                <h2 className="text-sm font-semibold text-ethiopian-cream/70 uppercase tracking-wider">{t("kds.butcher")}</h2>
                <Badge variant="secondary" className="text-xs ml-auto text-ethiopian-cream/70 bg-ethiopian-gold/10">{butcherOrders.filter(b => b.kitchenStatus === "WAITING").length}</Badge>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1">
                <AnimatePresence mode="popLayout">
                  {butcherOrders.filter(bo => bo.kitchenStatus === "WAITING").map((bo) => (
                    <motion.div key={bo.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <Card className="border-l-4 border-ethiopian-clay/30 bg-clay-50 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <DishThumb name={bo.menuItemName} size="sm" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-base text-ethiopian-coffee dark:text-ethiopian-cream">#{bo.orderNumber}</span>
                                  <Badge variant="outline" className="text-xs text-ethiopian-clay border-ethiopian-clay/30">{t("kds.butcher")}</Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-ethiopian-coffee/60 dark:text-ethiopian-cream/70">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(bo.createdAt)}</span>
                                  {bo.tableNumber && <span>Table {bo.tableNumber}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-ethiopian-clay">{bo.menuItemName}</span>
                              <span className="font-semibold text-ethiopian-coffee dark:text-ethiopian-cream">×{bo.quantity}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-ethiopian-coffee/60 dark:text-ethiopian-cream/70">
                              <span className="text-ethiopian-burgundy font-medium">{bo.meatType}</span>
                              <span>·</span>
                              <span>{bo.weight} kg</span>
                            </div>
                            {bo.notes && <p className="text-xs text-ethiopian-coffee/50 dark:text-ethiopian-cream/50 italic">"{bo.notes}"</p>}
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-ethiopian-gold/10">
                            {bo.kitchenStatus === "WAITING" && (
                              <Button size="sm" variant="premium" onClick={() => handleButcherReceived(bo)} className="h-8 text-xs gap-1">
                                <CheckCircle className="h-3 w-3" /> {t("kds.received")}
                              </Button>
                            )}
                            {bo.kitchenStatus === "RECEIVED" && (
                              <Badge variant="secondary" className="text-xs">Received</Badge>
                            )}
                            {isAdmin && (
                              <button
                                onClick={async () => {
                                  if (!confirm("Delete this butcher order?")) return;
                                  try {
                                    const res = await fetch(`/api/butcher-orders?id=${encodeURIComponent(bo.id)}`, { method: "DELETE" });
                                    const d = await res.json();
                                    if (d.success) { toast.success("Deleted"); fetchButcherOrders(); }
                                    else { toast.error(d.error || "Failed"); }
                                  } catch { toast.error("Failed"); }
                                }}
                                className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-medium"
                                title="Delete order"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {butcherOrders.filter(b => b.kitchenStatus === "WAITING").length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-ethiopian-coffee/50 dark:text-ethiopian-cream/50 border border-dashed border-ethiopian-gold/20 rounded-xl">
                    {t("orders.noOrders")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}