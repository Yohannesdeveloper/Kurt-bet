"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CookingPot, Clock, XCircle, ChevronRight, UtensilsCrossed, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cookingNotes?: string;
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
  NEW:       { next: "PREPARING", label: "Pending",       color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  PREPARING: { next: "READY",     label: "Preparing",     color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200",  dot: "bg-blue-500" },
  READY:     { next: "SERVED",    label: "Ready for Pickup", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  SERVED:    { next: null,        label: "Served",        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED: { next: null,        label: "Cancelled",     color: "text-red-600",  bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-500" },
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

const OrderCard = memo(function OrderCard({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, status: string) => void }) {
  const s = STATUS_FLOW[order.status] || STATUS_FLOW.NEW;
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (d.success) {
        onStatusUpdate(order.id, newStatus);
        toast.success(`Order #${order.orderNumber} → ${STATUS_FLOW[newStatus]?.label || newStatus}`);
      }
    } catch {} finally {
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
                <span className="font-bold text-base">#{order.orderNumber}</span>
                <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(order.createdAt)}</span>
                {order.table && <span className="flex items-center gap-1"><UtensilsCrossed className="h-3 w-3" />Table {order.table.number}</span>}
                {order.guestCount && <span>{order.guestCount} guests</span>}
              </div>
            </div>
            {order.notes && (
              <div className="text-xs text-muted-foreground max-w-[120px] text-right truncate" title={order.notes}>
                📝 {order.notes}
              </div>
            )}
          </div>

          <div className="space-y-1 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-medium"><span className="text-muted-foreground mr-1">×{item.quantity}</span>{item.name}</span>
                {item.cookingNotes && <span className="text-xs text-muted-foreground ml-2">({item.cookingNotes})</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {s.next && (
              <Button
                size="sm"
                variant="default"
                disabled={updating}
                onClick={() => handleStatus(s.next!)}
                className="h-8 text-xs gap-1"
              >
                {updating ? "..." : <><ChevronRight className="h-3 w-3" /> {STATUS_FLOW[s.next]?.label}</>}
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
                <XCircle className="h-3 w-3 mr-1" />Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    fetch("/api/orders?status=NEW,PREPARING,READY,SERVED&approved=true")
      .then(r => r.json())
      .then(d => {
        if (d.success) setOrders(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const grouped = STATUS_ORDER.map(status => ({
    status,
    label: STATUS_FLOW[status]?.label || status,
    color: STATUS_FLOW[status]?.color || "",
    dot: STATUS_FLOW[status]?.dot || "",
    orders: orders.filter(o => o.status === status),
  }));

  const hasOrders = orders.length > 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20">
            <CookingPot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Kitchen Display</h1>
            <p className="text-xs text-muted-foreground">{orders.length} orders active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : !hasOrders ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ChefHat className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No pending orders</p>
            <p className="text-sm">Orders from the POS will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {grouped.map(grp => (
              <div key={grp.status} className="flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${grp.dot}`} />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{grp.label}</h2>
                  <Badge variant="secondary" className="text-xs ml-auto">{grp.orders.length}</Badge>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1">
                  <AnimatePresence mode="popLayout">
                    {grp.orders.map(order => (
                      <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
                    ))}
                  </AnimatePresence>
                  {grp.orders.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border border-dashed rounded-xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
