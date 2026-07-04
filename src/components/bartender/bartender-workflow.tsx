"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Clock, ChevronRight, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

type BartenderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type BartenderOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  items: BartenderItem[];
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  createdAt: string;
  completedAt: string | null;
};

const STATUS_FLOW: Record<string, { next: string | null; tKey: string; color: string; bg: string; border: string; dot: string }> = {
  PENDING:   { next: "PREPARING", tKey: "bartender.tabPending",     color: "text-amber-600", bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500" },
  PREPARING: { next: "READY",     tKey: "bartender.tabPreparing",   color: "text-blue-600",  bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500" },
  READY:     { next: "SERVED",    tKey: "bartender.tabReady", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  SERVED:    { next: null,        tKey: "bartender.tabServed",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const COLUMNS = ["PENDING", "PREPARING", "READY", "SERVED"];

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function BartenderWorkflow() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  const { t } = useTranslation();
  const [orders, setOrders] = useState<BartenderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    fetch("/api/bartender-orders?status=PENDING,PREPARING,READY,SERVED")
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatus = async (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as BartenderOrder["status"] } : o));
    const nextLabel = t(STATUS_FLOW[newStatus]?.tKey || newStatus);
    try {
      const res = await fetch("/api/bartender-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(t("bartender.drinkOrderUpdated", { orderNumber: d.data.orderNumber, status: nextLabel }));
      } else {
        toast.error(d.error || t("bartender.updateFailed"));
        fetchOrders();
      }
    } catch {
      toast.error(t("bartender.updateFailedNetwork"));
      fetchOrders();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("bartender.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/bartender-orders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { toast.success(t("bartender.deleted")); fetchOrders(); }
      else { toast.error(d.error || t("bartender.failed")); }
    } catch { toast.error(t("bartender.failed")); }
  };

  const grouped = COLUMNS.map(status => ({
    status,
    label: t(STATUS_FLOW[status]?.tKey || status),
    color: STATUS_FLOW[status]?.color || "",
    dot: STATUS_FLOW[status]?.dot || "",
    orders: orders.filter(o => o.status === status),
  }));

  const servedOrders = orders.filter(o => o.status === "SERVED");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-ethiopian-coffee/50">
          <div className="w-4 h-4 border-2 border-ethiopian-gold/20 border-t-ethiopian-gold rounded-full animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-ethiopian-coffee/50">
        <Coffee className="h-20 w-20 opacity-20 mb-4" />
        <p className="text-lg font-semibold text-ethiopian-coffee">{t("bartender.noOrders")}</p>
        <p className="text-sm">{t("bartender.noOrdersDesc")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-ethiopian-coffee font-serif">{t("bartender.title")}</h2>
          <span className="text-sm text-ethiopian-coffee/50">{t("bartender.drinkOrders", { count: orders.length })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-ethiopian-coffee/50">{t("bartender.live")}</span>
          {servedOrders.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-2">{t("bartender.served", { count: servedOrders.length })}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map(grp => (
          <div key={grp.status} className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`h-2.5 w-2.5 rounded-full ${grp.dot}`} />
              <h2 className="text-sm font-semibold text-ethiopian-coffee/70 uppercase tracking-wider">{grp.label}</h2>
              <Badge variant="secondary" className="text-xs ml-auto">{grp.orders.length}</Badge>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1 max-h-[calc(100vh-18rem)]">
              <AnimatePresence mode="popLayout">
                {grp.orders.map(order => {
                  const s = STATUS_FLOW[order.status] || STATUS_FLOW.PENDING;
                  const statusLabel = t(s.tKey);
                  return (
                    <motion.div key={order.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <Card className={`border-l-4 ${s.border} ${s.bg} shadow-sm hover:shadow-md transition-shadow`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                                <span className="font-bold text-base text-ethiopian-coffee">#{order.orderNumber}</span>
                                <Badge variant={order.status === "PENDING" ? "premium" : "outline"} className={`text-xs ${s.color}`}>{statusLabel}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-ethiopian-coffee/60">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(order.createdAt)}</span>
                                {order.tableNumber && <span>{t("bartender.table", { number: order.tableNumber })}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1 mb-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-ethiopian-coffee"><span className="text-ethiopian-coffee/50 mr-1">×{item.quantity}</span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && <p className="text-xs text-ethiopian-coffee/50 italic mb-2">"{order.notes}"</p>}
                          <div className="flex items-center gap-2 pt-2 border-t border-ethiopian-gold/10">
                            {s.next && (
                              <Button size="sm" variant="premium" onClick={() => handleStatus(order.id, s.next!)} className="h-8 text-xs gap-1">
                                <ChevronRight className="h-3 w-3" /> {t(STATUS_FLOW[s.next!]?.tKey || s.next!)}
                              </Button>
                            )}
                            {order.status === "SERVED" && (
                              <Badge variant="secondary" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />{statusLabel}</Badge>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-medium"
                                title={t("bartender.delete")}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> {t("bartender.delete")}
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {grp.orders.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-ethiopian-coffee/50 border border-dashed border-ethiopian-gold/20 rounded-xl">
                  {t("bartender.noOrdersColumn")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
