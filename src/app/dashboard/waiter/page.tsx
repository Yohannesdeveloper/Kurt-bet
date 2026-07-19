"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Clock, Package, Users, ClipboardList, CreditCard, Plus, Table, DollarSign, Hand, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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

export default function WaiterDashboard() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [butcherOrders, setButcherOrders] = useState<ButcherOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashflowRevenue, setCashflowRevenue] = useState(0);
  const [cashflowCount, setCashflowCount] = useState(0);

  const role = (session?.user as { role?: string })?.role;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/butcher-orders");
      const data = await res.json();
      if (data.success) setButcherOrders(data.data);
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

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch("/api/cashflow?employee=waiter");
        const data = await res.json();
        if (data.success) {
          setCashflowRevenue(data.data.summary.waiterRevenue);
          setCashflowCount(data.data.summary.waiterCount);
        }
      } catch {}
    }
    fetchCashflow();
  }, []);

  if (role !== "WAITER" && role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="w-16 h-16 text-ethiopian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ethiopian-coffee">{t("waiter.accessDenied")}</h2>
          <p className="text-ethiopian-coffee/60 mt-2">{t("waiter.accessDeniedDesc")}</p>
        </div>
      </div>
    );
  }

  const pendingButcherCount = butcherOrders.filter((o) => o.status === "PENDING").length;

  const KURT_KEYWORDS = ["kurt", "qurt", "ቁርጥ"];
  function isKurtOrder(name: string) {
    const lower = (name || "").toLowerCase();
    return KURT_KEYWORDS.some((kw) => lower.includes(kw));
  }

  const kurtPickupOrders = butcherOrders.filter(o => o.status === "APPROVED" && isKurtOrder(o.menuItemName));
  const nonKurtOrders = butcherOrders.filter(o => !isKurtOrder(o.menuItemName));

  const stats = [
    { label: t("waiter.pendingButcherOrders"), value: pendingButcherCount.toString(), icon: Beef, color: "from-ethiopian-gold to-ethiopian-coffee", bgColor: "bg-ethiopian-gold/10", iconColor: "text-ethiopian-gold" },
    { label: t("waiter.cashFlow"), value: formatCurrency(cashflowRevenue), icon: DollarSign, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: t("waiter.ordersServed"), value: cashflowCount.toString(), icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: t("waiter.paymentsPending"), value: "0", icon: CreditCard, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-ethiopian-burgundy to-ethiopian-gold text-white shadow-lg"
          >
            <Users className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif text-ethiopian-coffee">
              {t("waiter.dashboardTitle")}
            </h1>
            <p className="text-ethiopian-coffee/60 mt-1">
              {pendingButcherCount > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{t("waiter.xOrdersPending", { count: pendingButcherCount })}</span>
              ) : (
                t("waiter.noPendingOrders")
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((s, index) => (
          <motion.div
            key={s.label}
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
                <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{s.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {kurtPickupOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg"
            >
              <Hand className="w-5 h-5" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-ethiopian-burgundy">{t("waiter.qurtReady")}</h2>
              <p className="text-sm text-ethiopian-coffee/60">
                {t("waiter.pickupFromButcher", { count: kurtPickupOrders.length })}
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {kurtPickupOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-300 hover:shadow-xl transition-all duration-300 p-5"
              >
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="text-lg font-bold text-ethiopian-coffee">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="text-sm font-semibold text-ethiopian-gold">{t("waiter.table", { number: order.tableNumber })}</span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-200 text-amber-900 border-amber-400">
                    {t("waiter.readyForPickup")}
                  </span>
                  <Hand className="w-4 h-4 text-amber-600 ml-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-amber-200 rounded-lg bg-white/60">
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.meatType")}</p>
                    <p className="text-sm font-bold text-ethiopian-burgundy">{order.meatType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.dish")}</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">{order.menuItemName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.weight")}</p>
                    <p className="text-sm font-bold text-ethiopian-gold">{order.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.quantity")}</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">x{order.quantity}</p>
                  </div>
                  {order.notes && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-ethiopian-coffee/40">{t("waiter.notes")}</p>
                      <p className="text-sm italic text-ethiopian-coffee/70">{order.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-ethiopian-coffee/60">
                    <Clock className="w-3.5 h-3.5" />
                    {order.approvedAt ? new Date(order.approvedAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-sm font-semibold hover:shadow-lg transition-all">
                    <CheckCircle className="w-4 h-4" /> {t("waiter.pickedUp")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-ethiopian-coffee">{t("waiter.butcherOrdersSection")}</h2>
        {loading ? (
          <div className="text-center py-12 text-ethiopian-coffee/60">{t("common.loading")}</div>
        ) : butcherOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
            <p className="text-ethiopian-coffee/60">{t("waiter.noButcherOrders")}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {butcherOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md border border-ethiopian-gold/10 hover:shadow-xl transition-all duration-300 p-5"
              >
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="text-lg font-bold text-ethiopian-coffee">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="text-sm font-semibold text-ethiopian-gold">{t("waiter.table", { number: order.tableNumber })}</span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    order.status === "PENDING"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-green-100 text-green-800 border-green-300"
                  }`}>
                    {order.status === "PENDING" ? t("waiter.pending") : t("waiter.approved")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20">
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.meatType")}</p>
                    <p className="text-sm font-bold text-ethiopian-burgundy">{order.meatType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.dish")}</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">{order.menuItemName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.weight")}</p>
                    <p className="text-sm font-bold text-ethiopian-gold">{order.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.quantity")}</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">x{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">{t("waiter.kitchen")}</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">
                      {order.kitchenStatus === "RECEIVED" ? t("waiter.received") : t("waiter.waiting")}
                    </p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">{t("waiter.notes")}</p>
                      <p className="text-sm italic text-ethiopian-coffee/70">{order.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-ethiopian-coffee/60">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t("waiter.quickActions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="default" asChild>
                  <Link href="/orders">
                    <Plus className="h-4 w-4" />
                    {t("orders.newOrder")}
                  </Link>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <Link href="/tables">
                    <Table className="h-4 w-4" />
                    {t("nav.tables")}
                  </Link>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <Link href="/menu">
                    <ClipboardList className="h-4 w-4" />
                    {t("waiter.viewMenu")}
                  </Link>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <Link href="/payments">
                    <CreditCard className="h-4 w-4" />
                    {t("waiter.processPayments")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}