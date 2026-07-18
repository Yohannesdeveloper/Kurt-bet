"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Beef, Check, XCircle, Clock, Package, Minus, Plus, ChevronDown, ChevronUp, Save, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const meatTypes = ["Beef", "Lamb", "Goat", "Chicken"];
const weightPresets = [0.5, 1, 2, 3, 5];
const dishOptions = ["Tibs", "Kurt", "Dulet", "Gored Gored"];

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

const statusLabel: Record<string, string> = {
  PENDING: "Pending Approval",
  APPROVED: "Approved - Sent to Kitchen",
  REJECTED: "Rejected",
};

export default function ButcherDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<ButcherOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "status">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fMeatType, setFMeatType] = useState("Beef");
  const [fDish, setFDish] = useState("Tibs");
  const [fWeight, setFWeight] = useState("1");
  const [fCustomWeight, setFCustomWeight] = useState(false);
  const [fQuantity, setFQuantity] = useState(1);
  const [fTable, setFTable] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fSubmitting, setFSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get("shop") === "1");

  const [cashflowRevenue, setCashflowRevenue] = useState(0);
  const [cashflowCount, setCashflowCount] = useState(0);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ meatType: string; menuItemName: string; weight: string; quantity: number; notes: string }>({ meatType: "", menuItemName: "", weight: "", quantity: 1, notes: "" });

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
          ? `Order #${order.orderNumber} approved — waiter notified for pickup`
          : `Order #${order.orderNumber} approved and sent to kitchen`);
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

  const startEditing = (order: ButcherOrder) => {
    setEditingOrder(order.id);
    setEditFields({
      meatType: order.meatType || "Beef",
      menuItemName: order.menuItemName || "",
      weight: String(order.weight || 1),
      quantity: order.quantity || 1,
      notes: order.notes || "",
    });
  };

  const saveFields = async (order: ButcherOrder) => {
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          meatType: editFields.meatType,
          menuItemName: editFields.menuItemName,
          weight: parseFloat(editFields.weight) || 1,
          quantity: editFields.quantity,
          notes: editFields.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order updated");
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const placeOrder = async () => {
    const w = parseFloat(fWeight);
    if (!w || w <= 0) { toast.error("Select a weight"); return; }
    setFSubmitting(true);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meatType: fMeatType,
          menuItemName: fDish,
          weight: w,
          quantity: fQuantity,
          tableNumber: fTable || null,
          notes: fNotes || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Butcher order #${data.data.orderNumber} placed!`);
        setFMeatType("Beef");
        setFDish("Tibs");
        setFWeight("1");
        setFQuantity(1);
        setFTable("");
        setFNotes("");
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch { toast.error("Failed to place order"); }
    finally { setFSubmitting(false); }
  };

  if (role !== "BUTCHER") {
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
  const statusOrders = orders.filter((o) => o.status !== "PENDING");

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
            <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">Butcher Dashboard</h1>
            <p className="text-sm text-ethiopian-coffee/60">
              {pendingOrders.length > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} waiting for approval</span>
              ) : (
                "All orders processed"
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
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{cashflowCount} items</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Butcher Cash Flow</p>
            <p className="text-2xl font-bold tracking-tight text-red-700">{formatCurrency(cashflowRevenue)}</p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-ethiopian-gold/10 overflow-hidden">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-ethiopian-cream/30 transition-colors">
          <h2 className="text-lg font-bold font-serif text-ethiopian-coffee">New Butcher Order</h2>
          {showForm ? <ChevronUp className="w-5 h-5 text-ethiopian-coffee/60" /> : <ChevronDown className="w-5 h-5 text-ethiopian-coffee/60" />}
        </button>
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-2">Meat Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {meatTypes.map((type) => (
                      <button key={type} onClick={() => setFMeatType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          fMeatType === type ? "bg-ethiopian-burgundy text-white shadow-md" : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                        }`}
                      >{type}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-2">Dish</label>
                  <div className="flex flex-wrap gap-1.5">
                    {dishOptions.map((dish) => (
                      <button key={dish} onClick={() => setFDish(dish)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          fDish === dish ? "bg-ethiopian-gold text-white shadow-md" : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                        }`}
                      >{dish}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-2">Weight (kg)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {weightPresets.map((w) => (
                      <button key={w} onClick={() => { setFWeight(w.toString()); setFCustomWeight(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          fWeight === w.toString() && !fCustomWeight ? "bg-ethiopian-burgundy text-white shadow-md" : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                        }`}
                      >{w} kg</button>
                    ))}
                    <button onClick={() => setFCustomWeight(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        fCustomWeight ? "bg-ethiopian-gold text-white shadow-md" : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                      }`}
                    >Custom</button>
                  </div>
                  {fCustomWeight && (
                    <input type="number" step="0.1" min="0.1" value={fWeight} onChange={(e) => setFWeight(e.target.value)}
                      className="mt-1.5 w-full px-2 py-1.5 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none text-xs"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFQuantity(Math.max(1, fQuantity - 1))} className="w-8 h-8 rounded-lg bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 flex items-center justify-center">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-lg font-bold text-ethiopian-gold min-w-[1.5rem] text-center">{fQuantity}</span>
                    <button onClick={() => setFQuantity(Math.min(20, fQuantity + 1))} className="w-8 h-8 rounded-lg bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-1.5">Table (optional)</label>
                  <input type="text" value={fTable} onChange={(e) => setFTable(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-1.5 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ethiopian-coffee mb-1.5">Notes (optional)</label>
                  <input type="text" value={fNotes} onChange={(e) => setFNotes(e.target.value)}
                    placeholder="Special instructions"
                    className="w-full px-3 py-1.5 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button onClick={placeOrder} disabled={fSubmitting}
                    className="w-full px-5 py-2 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {fSubmitting ? "Placing..." : "Place Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          Pending Orders
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
      ) : (activeTab === "pending" ? pendingOrders : statusOrders).length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
          <p className="text-ethiopian-coffee/60">
            {activeTab === "pending" ? "No orders waiting for approval" : "No processed orders yet"}
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
                    <span className="text-sm font-semibold text-ethiopian-gold">Table {order.tableNumber}</span>
                  )}
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20">
                  {editingOrder === order.id ? (
                    <>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40 mb-1">Meat Type</p>
                        <select value={editFields.meatType} onChange={(e) => setEditFields({ ...editFields, meatType: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white text-ethiopian-burgundy border border-ethiopian-gold/30 text-sm font-bold focus:outline-none focus:border-ethiopian-gold">
                          <option>Beef</option><option>Lamb</option><option>Goat</option><option>Chicken</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40 mb-1">Dish</p>
                        <input type="text" value={editFields.menuItemName} onChange={(e) => setEditFields({ ...editFields, menuItemName: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white text-ethiopian-coffee border border-ethiopian-gold/30 text-sm font-semibold focus:outline-none focus:border-ethiopian-gold" />
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40 mb-1">Weight (kg)</p>
                        <input type="number" step="0.25" min="0.25" value={editFields.weight} onChange={(e) => setEditFields({ ...editFields, weight: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white text-ethiopian-gold border border-ethiopian-gold/30 text-sm font-bold focus:outline-none focus:border-ethiopian-gold" />
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40 mb-1">Quantity</p>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditFields({ ...editFields, quantity: Math.max(1, editFields.quantity - 1) })}
                            className="w-7 h-7 rounded-lg bg-ethiopian-cream hover:bg-ethiopian-gold/20 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-semibold text-ethiopian-coffee min-w-[1.5rem] text-center">{editFields.quantity}</span>
                          <button onClick={() => setEditFields({ ...editFields, quantity: editFields.quantity + 1 })}
                            className="w-7 h-7 rounded-lg bg-ethiopian-cream hover:bg-ethiopian-gold/20 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Meat Type</p>
                        <p className="text-sm font-bold text-ethiopian-burgundy">{order.meatType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Dish</p>
                        <p className="text-sm font-semibold text-ethiopian-coffee">{order.menuItemName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Weight</p>
                        <p className="text-sm font-bold text-ethiopian-gold">{order.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-ethiopian-coffee/40">Quantity</p>
                        <p className="text-sm font-semibold text-ethiopian-coffee">x{order.quantity}</p>
                      </div>
                    </>
                  )}
                </div>

                {editingOrder === order.id ? (
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40 mb-1">Notes</p>
                    <input type="text" value={editFields.notes} onChange={(e) => setEditFields({ ...editFields, notes: e.target.value })}
                      placeholder="Special instructions"
                      className="w-full px-2 py-1.5 rounded-lg bg-white text-ethiopian-coffee border border-ethiopian-gold/30 text-sm italic focus:outline-none focus:border-ethiopian-gold" />
                  </div>
                ) : order.notes && (
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
                    Approved: {new Date(order.approvedAt).toLocaleString()}
                  </div>
                )}
                {order.status === "REJECTED" && order.rejectedAt && (
                  <div className="text-xs text-red-600 font-medium">
                    Rejected: {new Date(order.rejectedAt).toLocaleString()}
                  </div>
                )}

                {activeTab === "pending" && order.status === "PENDING" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-ethiopian-gold/10">
                    {editingOrder === order.id ? (
                      <>
                        <button
                          onClick={() => saveFields(order)}
                          disabled={actionLoading === order.id}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.id ? "..." : <><Save className="w-4 h-4" /> Save</>}
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(order)}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-ethiopian-cream text-ethiopian-coffee text-sm font-medium hover:bg-ethiopian-gold/20 transition-all border border-ethiopian-gold/20"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => approveOrder(order)}
                          disabled={actionLoading === order.id}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.id ? "..." : (
                            <><Check className="w-4 h-4" /> {isKurtOrder(order.menuItemName) ? "Approve & Notify Waiter" : "Approve & Send to Kitchen"}</>
                          )}
                        </button>
                        <button
                          onClick={() => rejectOrder(order)}
                          disabled={actionLoading === order.id}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
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
