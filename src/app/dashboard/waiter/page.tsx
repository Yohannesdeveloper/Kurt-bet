"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Clock, Package, Users, ClipboardList, CreditCard, Plus, Table } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  if (role !== "WAITER" && role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="w-16 h-16 text-ethiopian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ethiopian-coffee">Access Denied</h2>
          <p className="text-ethiopian-coffee/60 mt-2">Waiter or Admin access required</p>
        </div>
      </div>
    );
  }

  const pendingButcherCount = butcherOrders.filter((o) => o.status === "PENDING").length;

  const stats = [
    { label: "Pending Butcher Orders", value: pendingButcherCount.toString(), icon: Beef, color: "from-ethiopian-gold to-ethiopian-coffee", bgColor: "bg-ethiopian-gold/10", iconColor: "text-ethiopian-gold" },
    { label: "Active Orders", value: "0", icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Payments Pending", value: "0", icon: CreditCard, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Orders Completed", value: "0", icon: ClipboardList, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
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
              Waiter Dashboard
            </h1>
            <p className="text-ethiopian-coffee/60 mt-1">
              {pendingButcherCount > 0 ? (
                <span className="text-ethiopian-burgundy font-semibold">{pendingButcherCount} butcher order{pendingButcherCount > 1 ? "s" : ""} pending</span>
              ) : (
                "No pending butcher orders"
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-ethiopian-coffee">Butcher Orders</h2>
        {loading ? (
          <div className="text-center py-12 text-ethiopian-coffee/60">{t("common.loading")}</div>
        ) : butcherOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
            <p className="text-ethiopian-coffee/60">No butcher orders</p>
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
                    <span className="text-sm font-semibold text-ethiopian-gold">Table {order.tableNumber}</span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    order.status === "PENDING"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-green-100 text-green-800 border-green-300"
                  }`}>
                    {order.status === "PENDING" ? "Pending" : "Approved"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20">
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
                  <div>
                    <p className="text-xs text-ethiopian-coffee/40">Kitchen</p>
                    <p className="text-sm font-semibold text-ethiopian-coffee">
                      {order.kitchenStatus === "RECEIVED" ? "Received" : "Waiting"}
                    </p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-xs text-ethiopian-coffee/40">Notes</p>
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
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="default" asChild>
                  <a href="/orders">
                    <Plus className="h-4 w-4" />
                    {t("orders.newOrder")}
                  </a>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <a href="/tables">
                    <Table className="h-4 w-4" />
                    {t("nav.tables")}
                  </a>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <a href="/menu">
                    <ClipboardList className="h-4 w-4" />
                    View Menu
                  </a>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <a href="/payments">
                    <CreditCard className="h-4 w-4" />
                    Process Payments
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}