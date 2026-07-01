"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, CheckCircle, AlertCircle, Flame, Timer, CookingPot, Beef } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

const STATUS_ORDER = ["NEW", "PREPARING", "READY", "SERVED"];

  const statsConfig = {
    NEW:       { label: "Pending Orders",   value: "0", icon: Clock,       color: "from-amber-500 to-orange-600",    bgColor: "bg-amber-500/10",  iconColor: "text-amber-600" },
    PREPARING: { label: "In Progress",      value: "0", icon: Flame,       color: "from-orange-500 to-red-600",     bgColor: "bg-orange-500/10",  iconColor: "text-orange-600" },
    READY:     { label: "Ready to Serve",   value: "0", icon: CheckCircle, color: "from-[#C89B3C] to-[#3E2723]",  bgColor: "bg-[#C89B3C]/10", iconColor: "text-[#C89B3C]" },
    SERVED:    { label: "Served Today",     value: "0", icon: Timer,       color: "from-blue-500 to-cyan-600",     bgColor: "bg-blue-500/10",   iconColor: "text-blue-600" },
    BUTCHER:   { label: "Butcher Orders",  value: "0", icon: Beef,        color: "from-[#A12222] to-[#C89B3C]",  bgColor: "bg-red-500/10",   iconColor: "text-[#A12222]" },
  };

export default function KitchenDashboard() {
  const { t } = useTranslation();
  const statusLabels: Record<string, string> = {
    NEW: t("orders.pending"),
    PREPARING: t("orders.preparing"),
    READY: t("orders.ready"),
    SERVED: t("orders.delivered"),
    BUTCHER: t("dashboard.butcherOrders"),
  };
  const [counts, setCounts] = useState<Record<string, number>>({ NEW: 0, PREPARING: 0, READY: 0, SERVED: 0 });
  const [butcherCount, setButcherCount] = useState(0);

  const fetchCounts = useCallback(() => {
    fetch("/api/orders?status=NEW,PREPARING,READY,SERVED")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const c: Record<string, number> = { NEW: 0, PREPARING: 0, READY: 0, SERVED: 0 };
          d.data.forEach((o: any) => { if (c[o.status] !== undefined) c[o.status]++; });
          setCounts(c);
        }
      })
      .catch(() => {});
    fetch("/api/butcher-orders?status=SENT_TO_KITCHEN")
      .then(r => r.json())
      .then(d => { if (d.success) setButcherCount(d.data.length); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) + butcherCount;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("nav.kitchen")} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage incoming orders and kitchen queue</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#C89B3C] animate-pulse" />
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{total} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {STATUS_ORDER.map((status, index) => {
          const s = statsConfig[status as keyof typeof statsConfig];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl ${s.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <s.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${s.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{statusLabels[status]}</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight">{counts[status]}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {/* Butcher stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Beef className="h-5 w-5 lg:h-6 lg:w-6 text-[#A12222]" />
                </div>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{t("dashboard.butcherOrders")}</p>
              <p className="text-2xl lg:text-3xl font-bold tracking-tight">{butcherCount}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Order Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {STATUS_ORDER.map((status) => {
                const colors: Record<string, string> = { NEW: "bg-amber-500", PREPARING: "bg-blue-500", READY: "bg-orange-500", SERVED: "bg-green-500" };
                const labels: Record<string, string> = { NEW: t("orders.pending"), PREPARING: t("orders.preparing"), READY: t("orders.ready"), SERVED: t("orders.delivered") };
                return (
                  <div key={status} className="text-center">
                    <div className={`h-12 w-12 rounded-full ${colors[status]} flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold text-lg">{counts[status]}</span>
                    </div>
                    <p className="text-sm font-medium">{labels[status]}</p>
                  </div>
                );
              })}
            </div>
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ChefHat className="h-16 w-16 mb-4 opacity-50" />
                <p className="font-medium mb-1">No orders in queue</p>
                <p className="text-sm">New orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {STATUS_ORDER.flatMap(status =>
                  Array.from({ length: Math.min(counts[status], 3) }).map((_, i) => (
                    <div key={`${status}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`h-2 w-2 rounded-full ${statsConfig[status as keyof typeof statsConfig].bgColor}`} />
                      <span className="text-sm font-medium">{statusLabels[status]}</span>
                      <span className="text-xs text-muted-foreground ml-auto">In queue</span>
                    </div>
                  ))
                )}
              </div>
            )}
            <Button className="w-full mt-4" asChild>
              <Link href="/kds">
                <CookingPot className="h-4 w-4 mr-2" />
                Open Kitchen Display System
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
