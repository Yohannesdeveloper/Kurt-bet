"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Check, XCircle, Clock, Package, Scale, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

type ButcherOrderItem = {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  dish: string;
};

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  tableNumber?: string;
  customerName: string;
  customerId: string;
  items: ButcherOrderItem[];
  preparationNotes: string;
  meatWeightKg?: number;
  status: "PENDING" | "SENT_TO_KITCHEN" | "KITCHEN_RECEIVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
  sentToKitchenAt?: string;
  receivedAt?: string;
  rejectedAt?: string;
};

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  SENT_TO_KITCHEN: "bg-cyan-100 text-cyan-800 border-cyan-300",
  KITCHEN_RECEIVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending Approval",
  SENT_TO_KITCHEN: "Sent to Kitchen",
  KITCHEN_RECEIVED: "Kitchen Received",
  REJECTED: "Rejected",
};

export default function ButcherDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<ButcherOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"shop" | "status">("shop");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [weightInputs, setWeightInputs] = useState<Record<string, number>>({});
  const [customWeight, setCustomWeight] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});

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
    const weight = weightInputs[order.id] || 0;
    if (!weight || weight <= 0) {
      toast.error("Please select or enter a meat weight");
      return;
    }
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: "SENT_TO_KITCHEN",
          meatWeightKg: weight,
          preparationNotes: notesInputs[order.id] || order.preparationNotes || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${order.orderNumber} approved and sent to kitchen`);
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
        toast.success(`Order #${order.orderNumber} rejected`);
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

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const statusOrders = orders.filter((o) => ["SENT_TO_KITCHEN", "KITCHEN_RECEIVED", "REJECTED"].includes(o.status));

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
            <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">Butcher Shop</h1>
            <p className="text-sm text-ethiopian-coffee/60">
              {pendingOrders.length > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} waiting for approval</span>
              ) : (
                "No orders waiting for approval"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("shop")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "shop"
              ? "border-ethiopian-burgundy text-ethiopian-burgundy"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Butcher Shop
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
          Butcher Status
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ethiopian-cream">{statusOrders.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ethiopian-coffee/60">{t("common.loading")}</div>
      ) : (activeTab === "shop" ? pendingOrders : statusOrders).length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
          <p className="text-ethiopian-coffee/60">{t("orders.noOrders")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(activeTab === "shop" ? pendingOrders : statusOrders).map((order) => (
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
                    <span className="text-sm font-semibold text-ethiopian-gold">Table {order.tableNumber}</span>
                  )}
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 p-2 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20">
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Menu Item</p>
                        <p className="text-sm font-semibold text-ethiopian-coffee">{item.menuItemName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Quantity</p>
                        <p className="text-sm font-semibold text-ethiopian-coffee">x{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Dish</p>
                        <p className="text-sm font-semibold text-ethiopian-gold">{item.dish || "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-ethiopian-coffee/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                {activeTab === "shop" && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-ethiopian-coffee mb-2 block">
                        <Scale className="w-4 h-4 inline mr-1" />
                        Meat Weight (kg)
                      </label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {WEIGHT_OPTIONS.map((w) => (
                          <button
                            key={w}
                            onClick={() => {
                              setWeightInputs((prev) => ({ ...prev, [order.id]: w }));
                              setCustomWeight((prev) => ({ ...prev, [order.id]: "" }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              weightInputs[order.id] === w && (!customWeight[order.id] || customWeight[order.id] === "")
                                ? "bg-ethiopian-burgundy text-white shadow-md"
                                : "bg-gray-100 text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                            }`}
                          >
                            {w} kg
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ethiopian-coffee/60">Custom:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="0.0"
                          value={customWeight[order.id] || ""}
                          onChange={(e) => {
                            setCustomWeight((prev) => ({ ...prev, [order.id]: e.target.value }));
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setWeightInputs((prev) => ({ ...prev, [order.id]: val }));
                            }
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-gray-300 focus:border-ethiopian-gold focus:outline-none text-sm"
                        />
                        <span className="text-xs text-ethiopian-coffee/60">kg</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-ethiopian-coffee mb-1 block">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Preparation Notes
                      </label>
                      <textarea
                        value={notesInputs[order.id] !== undefined ? notesInputs[order.id] : order.preparationNotes || ""}
                        onChange={(e) => setNotesInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="e.g., Cut into small cubes, remove bones, mince finely..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-ethiopian-gold focus:outline-none text-sm resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveOrder(order)}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {actionLoading === order.id ? (
                          "..."
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Approve Meat
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => rejectOrder(order)}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {activeTab === "status" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Meat Weight</p>
                      <p className="text-sm font-bold text-ethiopian-burgundy">{order.meatWeightKg || "-"} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Approval Time</p>
                      <p className="text-sm font-medium text-ethiopian-coffee">
                        {order.approvedAt ? new Date(order.approvedAt).toLocaleString() : order.sentToKitchenAt ? new Date(order.sentToKitchenAt).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Kitchen Status</p>
                      <p className={`text-sm font-semibold ${order.status === "KITCHEN_RECEIVED" ? "text-emerald-600" : order.status === "SENT_TO_KITCHEN" ? "text-cyan-600" : "text-red-600"}`}>
                        {statusLabel[order.status]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Items</p>
                      <p className="text-sm font-medium text-ethiopian-coffee">
                        {order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} total
                      </p>
                    </div>
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
