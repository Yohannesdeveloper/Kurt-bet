"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Check, XCircle, Send, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

type ButcherOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  meatType: string;
  portionSize: string;
  quantity: number;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SENT_TO_KITCHEN";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  sentToKitchenAt?: string;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  SENT_TO_KITCHEN: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function ButcherDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const statusLabel: Record<string, string> = {
    PENDING: t("butcher.pending"),
    APPROVED: t("butcher.approved"),
    SENT_TO_KITCHEN: t("butcher.sentToKitchen"),
    REJECTED: t("butcher.rejected"),
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
        toast.success(`Order #${data.data.orderNumber} ${status.toLowerCase()}`);
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

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  if (role !== "BUTCHER" && role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Beef className="w-16 h-16 text-[#C89B3C] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3E2723]">Access Denied</h2>
          <p className="text-[#3E2723]/60 mt-2">Butcher or Admin access required</p>
        </div>
      </div>
    );
  }

  const filters = [
    { value: "all", label: t("menu.all"), count: orders.length },
    { value: "PENDING", label: t("butcher.pending"), count: orders.filter((o) => o.status === "PENDING").length },
    { value: "APPROVED", label: t("butcher.approved"), count: orders.filter((o) => o.status === "APPROVED").length },
    { value: "SENT_TO_KITCHEN", label: t("butcher.sentToKitchen"), count: orders.filter((o) => o.status === "SENT_TO_KITCHEN").length },
    { value: "REJECTED", label: t("butcher.rejected"), count: orders.filter((o) => o.status === "REJECTED").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] text-white shadow-lg"
          >
            <Beef className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">{t("nav.butcher")} Dashboard</h1>
            <p className="text-sm text-[#3E2723]/60">
              {pendingCount > 0 ? (
                <span className="text-[#A12222] font-semibold">{pendingCount} pending order{pendingCount > 1 ? "s" : ""}</span>
              ) : (
                "No pending orders"
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
                ? "bg-[#C89B3C] text-white shadow-md"
                : "bg-white text-[#3E2723] border border-gray-200 hover:border-[#C89B3C]"
            }`}
          >
            {f.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filter === f.value ? "bg-white/20" : "bg-[#F8F4EE]"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-[#3E2723]/60">{t("common.loading")}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-[#C89B3C] mx-auto mb-3" />
          <p className="text-[#3E2723]/60">{t("orders.noOrders")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-[#3E2723]">#{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-sm text-[#3E2723]/60 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-[#3E2723]/40">Customer</p>
                      <p className="text-sm font-semibold text-[#3E2723]">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#3E2723]/40">{t("butcher.meatType")}</p>
                      <p className="text-sm font-semibold text-[#A12222]">{order.meatType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#3E2723]/40">{t("butcher.portionSize")}</p>
                      <p className="text-sm font-semibold text-[#C89B3C]">{order.portionSize}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#3E2723]/40">{t("butcher.quantity")}</p>
                      <p className="text-sm font-semibold text-[#3E2723]">x{order.quantity}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <p className="text-sm text-[#3E2723]/70 italic">
                      "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {order.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "APPROVED")}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {t("butcher.approve")}
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "REJECTED")}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {t("butcher.reject")}
                      </button>
                    </>
                  )}
                  {order.status === "APPROVED" && (
                    <button
                      onClick={() => updateStatus(order.id, "SENT_TO_KITCHEN")}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {t("butcher.sendToKitchen")}
                    </button>
                  )}
                  {order.status === "SENT_TO_KITCHEN" && (
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {t("butcher.sentToKitchen")}
                    </span>
                  )}
                  {order.status === "REJECTED" && (
                    <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {t("butcher.rejected")}
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
