"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Check, XCircle, Send, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

type ButcherOrderItem = {
  meatType: string;
  portionSize: string;
  quantity: number;
  dish: string;
};

type ButcherOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  items: ButcherOrderItem[];
  notes: string;
  status: "PENDING" | "WAITER_APPROVED" | "BUTCHER_PREPARING" | "BUTCHER_APPROVED" | "SENT_TO_KITCHEN" | "KITCHEN_RECEIVED" | "REJECTED";
  createdAt: string;
  waiterApprovedAt?: string;
  butcherPreparingAt?: string;
  butcherApprovedAt?: string;
  sentToKitchenAt?: string;
  receivedAt?: string;
  rejectedAt?: string;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  WAITER_APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
  BUTCHER_PREPARING: "bg-purple-100 text-purple-800 border-purple-300",
  BUTCHER_APPROVED: "bg-green-100 text-green-800 border-green-300",
  SENT_TO_KITCHEN: "bg-cyan-100 text-cyan-800 border-cyan-300",
  KITCHEN_RECEIVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};

export default function ButcherDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const statusLabel: Record<string, string> = {
    PENDING: "Pending Waiter Approval",
    WAITER_APPROVED: "Waiter Approved",
    BUTCHER_PREPARING: "Preparing",
    BUTCHER_APPROVED: "Butcher Approved",
    SENT_TO_KITCHEN: "Sent to Kitchen",
    KITCHEN_RECEIVED: "Kitchen Received",
    REJECTED: "Rejected",
  };
  const [orders, setOrders] = useState<ButcherOrder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const role = (session?.user as { role?: string })?.role;

  const fetchOrders = useCallback(async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/butcher-orders${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${data.data.orderNumber} ${status.toLowerCase().replace('_', ' ')}`);
        fetchOrders();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingForButcherCount = orders.filter((o) => o.status === "WAITER_APPROVED").length;

  if (role !== "BUTCHER" && role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Beef className="w-16 h-16 text-ethiopian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ethiopian-coffee">Access Denied</h2>
          <p className="text-ethiopian-coffee/60 mt-2">Butcher or Admin access required</p>
        </div>
      </div>
    );
  }

  const filters = [
    { value: "all", label: t("menu.all"), count: orders.length },
    { value: "PENDING", label: "Pending Waiter", count: orders.filter((o) => o.status === "PENDING").length },
    { value: "WAITER_APPROVED", label: "Waiter Approved", count: orders.filter((o) => o.status === "WAITER_APPROVED").length },
    { value: "BUTCHER_PREPARING", label: "Preparing", count: orders.filter((o) => o.status === "BUTCHER_PREPARING").length },
    { value: "BUTCHER_APPROVED", label: "Butcher Approved", count: orders.filter((o) => o.status === "BUTCHER_APPROVED").length },
    { value: "SENT_TO_KITCHEN", label: "Sent to Kitchen", count: orders.filter((o) => o.status === "SENT_TO_KITCHEN").length },
    { value: "KITCHEN_RECEIVED", label: "Kitchen Received", count: orders.filter((o) => o.status === "KITCHEN_RECEIVED").length },
    { value: "REJECTED", label: "Rejected", count: orders.filter((o) => o.status === "REJECTED").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">{t("nav.butcher")} Dashboard</h1>
            <p className="text-sm text-ethiopian-coffee/60">
              {pendingForButcherCount > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{pendingForButcherCount} order{pendingForButcherCount > 1 ? "s" : ""} waiting to be prepared</span>
              ) : (
                "No orders waiting to be prepared"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-ethiopian-gold text-white shadow-md"
                : "bg-white text-ethiopian-coffee border border-gray-200 hover:border-ethiopian-gold"
            }`}
          >
            {f.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filter === f.value ? "bg-white/20" : "bg-ethiopian-cream"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-ethiopian-coffee/60">{t("common.loading")}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
          <p className="text-ethiopian-coffee/60">{t("orders.noOrders")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-ethiopian-gold/10 hover:shadow-xl hover:border-ethiopian-gold/20 transition-all duration-300 p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-ethiopian-coffee">#{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                      <span className="text-sm text-ethiopian-coffee/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Customer</p>
                      <p className="text-sm font-semibold text-ethiopian-coffee">{order.customerName}</p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="p-3 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-ethiopian-coffee/40">Dish</p>
                          <p className="text-sm font-semibold text-ethiopian-gold">{item.dish}</p>
                        </div>
                        <div>
                          <p className="text-xs text-ethiopian-coffee/40">Meat Type</p>
                          <p className="text-sm font-semibold text-ethiopian-burgundy">{item.meatType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-ethiopian-coffee/40">Portion</p>
                          <p className="text-sm font-semibold text-ethiopian-gold">{item.portionSize}</p>
                        </div>
                        <div>
                          <p className="text-xs text-ethiopian-coffee/40">Quantity</p>
                          <p className="text-sm font-semibold text-ethiopian-coffee">x{item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-sm text-ethiopian-coffee/70 italic">
                    "{order.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {order.status === "WAITER_APPROVED" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "BUTCHER_PREPARING")}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Start Preparing
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "REJECTED")}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === "BUTCHER_PREPARING" && (
                    <button
                      onClick={() => updateStatus(order.id, "BUTCHER_APPROVED")}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Mark as Prepared
                    </button>
                  )}
                  {order.status === "BUTCHER_APPROVED" && (
                    <button
                      onClick={() => updateStatus(order.id, "SENT_TO_KITCHEN")}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-burgundy text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Send to Kitchen
                    </button>
                  )}
                  {order.status === "SENT_TO_KITCHEN" && (
                    <span className="text-sm text-cyan-600 font-medium flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Sent to Kitchen
                    </span>
                  )}
                  {order.status === "KITCHEN_RECEIVED" && (
                    <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Kitchen Received
                    </span>
                  )}
                  {order.status === "REJECTED" && (
                    <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
