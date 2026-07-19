"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Check, XCircle, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const KURT_KEYWORDS = ["kurt", "qurt", "ቁርጥ"];
function isKurtOrder(name: string) {
  const lower = (name || "").toLowerCase();
  return KURT_KEYWORDS.some((kw) => lower.includes(kw));
}

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  customerId: string;
  meatType: string;
  menuItemName: string;
  weight: number;
  quantity: number;
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};



export default function ButcherDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<ButcherOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "status">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [cashflowRevenue, setCashflowRevenue] = useState(0);
  const [cashflowCount, setCashflowCount] = useState(0);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch("/api/cashflow?employee=butcher");
        const data = await res.json();
        if (data.success) {
          setCashflowRevenue(data.data.summary.butcherRevenue);
          setCashflowCount(data.data.summary.butcherCount);
        }
      } catch {}
    }
    fetchCashflow();
  }, []);

  const role = (session?.user as { role?: string })?.role;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/butcher-orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const approveOrder = async (order: ButcherOrder) => {
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isKurtOrder(order.menuItemName)
          ? t("butcher.orderApprovedWaiter", { orderNumber: order.orderNumber })
          : t("butcher.orderApprovedKitchen", { orderNumber: order.orderNumber }));
        fetchOrders();
      } else {
        toast.error(data.error || t("butcher.actionFailed"));
      }
    } catch {
      toast.error(t("butcher.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const rejectOrder = async (order: ButcherOrder) => {
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "REJECTED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("butcher.orderRejected", { orderNumber: order.orderNumber }));
        fetchOrders();
      } else {
        toast.error(data.error || t("butcher.actionFailed"));
      }
    } catch {
      toast.error(t("butcher.actionFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const statusOrders = orders.filter((o) => o.status !== "PENDING");

  if (role !== "BUTCHER") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Beef className="w-16 h-16 text-ethiopian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ethiopian-coffee">{t("butcher.accessDenied")}</h2>
          <p className="text-ethiopian-coffee/60 mt-2">{t("butcher.accessDeniedDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-ethiopian-burgundy to-ethiopian-gold text-white shadow-lg"
          >
            <Beef className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">{t("butcher.dashboardTitle")}</h1>
            <p className="text-sm text-ethiopian-coffee/60">
              {pendingOrders.length > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{t("butcher.ordersWaiting", { count: pendingOrders.length })}</span>
              ) : (
                t("butcher.allProcessed")
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="bg-white rounded-2xl shadow-md border border-red-200/50 hover:shadow-lg transition-all duration-300 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Beef className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{cashflowCount} {t("butcher.itemsLabel")}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{t("butcher.cashFlow")}</p>
            <p className="text-2xl font-bold tracking-tight text-red-700">{formatCurrency(cashflowRevenue)}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "pending"
              ? "border-ethiopian-burgundy text-ethiopian-burgundy"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("butcher.pendingOrdersTab")}
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ethiopian-cream">{pendingOrders.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("status")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "status"
              ? "border-ethiopian-burgundy text-ethiopian-burgundy"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("butcher.statusTab")}
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ethiopian-cream">{statusOrders.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ethiopian-coffee/60">{t("common.loading")}</div>
      ) : (activeTab === "pending" ? pendingOrders : statusOrders).length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
          <p className="text-ethiopian-coffee/60">
            {activeTab === "pending" ? t("butcher.noPendingOrders") : t("butcher.noProcessedOrders")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(activeTab === "pending" ? pendingOrders : statusOrders).map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-ethiopian-gold/10 hover:shadow-xl hover:border-ethiopian-gold/20 transition-all duration-300 p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-ethiopian-coffee">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="text-sm font-semibold text-ethiopian-gold">{t("butcher.table", { number: order.tableNumber })}</span>
                  )}
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                    {order.status === "PENDING" ? t("butcher.pendingLabel") : order.status === "APPROVED" ? t("butcher.approvedLabel") : t("butcher.rejectedLabel")}
                  </span>
                </div>

                {order.notes && (
                  <div className="text-sm text-ethiopian-coffee/70 italic border-l-2 border-ethiopian-gold/30 pl-3">
                    "{order.notes}"
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-ethiopian-coffee/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <span className="text-ethiopian-coffee/30">·</span>
                  <span>{order.customerName}</span>
                </div>

                {order.status === "APPROVED" && order.approvedAt && (
                  <div className="text-xs text-emerald-600 font-medium">
                    {t("butcher.approvedAt", { time: new Date(order.approvedAt).toLocaleString() })}
                  </div>
                )}
                {order.status === "REJECTED" && order.rejectedAt && (
                  <div className="text-xs text-red-600 font-medium">
                    {t("butcher.rejectedAt", { time: new Date(order.rejectedAt).toLocaleString() })}
                  </div>
                )}

                {activeTab === "pending" && order.status === "PENDING" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-ethiopian-gold/10">
                    <button
                      onClick={() => approveOrder(order)}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {actionLoading === order.id ? "..." : (
                        <><Check className="w-4 h-4" /> {isKurtOrder(order.menuItemName) ? t("butcher.approveNotifyWaiter") : t("butcher.approveAndSendToKitchen")}</>
                      )}
                    </button>
                    <button
                      onClick={() => rejectOrder(order)}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> {t("butcher.reject")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
