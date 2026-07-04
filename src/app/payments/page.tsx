"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CreditCard, Inbox, DollarSign, TrendingUp, ArrowUpRight, User, Beef, Coffee } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function PaymentsPage() {
  const [cashflow, setCashflow] = useState({ waiterRevenue: 0, waiterCount: 0, butcherRevenue: 0, butcherCount: 0, bartenderRevenue: 0, bartenderCount: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch("/api/cashflow");
        const data = await res.json();
        if (data.success) {
          setCashflow(data.data.summary);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchCashflow();
  }, []);

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(cashflow.totalRevenue), icon: DollarSign, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
    { label: "Waiters Cash Flow", value: formatCurrency(cashflow.waiterRevenue), icon: User, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Butcher Cash Flow", value: formatCurrency(cashflow.butcherRevenue), icon: Beef, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
    { label: "Bartender Cash Flow", value: formatCurrency(cashflow.bartenderRevenue), icon: Coffee, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 shadow-lg hover:from-ethiopian-gold/30 hover:to-ethiopian-clay/30 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-ethiopian-gold" />
          </Link>
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
            <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Payments</h1>
            <p className="text-sm text-muted-foreground">Cash flow overview by employee category</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <Tabs defaultValue="all">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <DollarSign className="h-4 w-4" /> All Cash Flow
                </TabsTrigger>
                <TabsTrigger value="waiter" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <User className="h-4 w-4" /> Waiters
                </TabsTrigger>
                <TabsTrigger value="butcher" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <Beef className="h-4 w-4" /> Butcher
                </TabsTrigger>
                <TabsTrigger value="bartender" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <Coffee className="h-4 w-4" /> Bartender
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Waiters</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(cashflow.waiterRevenue)}</p>
                    <p className="text-xs text-amber-600/70 mt-1">{cashflow.waiterCount} orders</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Beef className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">Butcher</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(cashflow.butcherRevenue)}</p>
                    <p className="text-xs text-red-600/70 mt-1">{cashflow.butcherCount} meat items</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Bartender</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(cashflow.bartenderRevenue)}</p>
                    <p className="text-xs text-emerald-600/70 mt-1">{cashflow.bartenderCount} drinks</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="waiter" className="mt-6">
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700 mb-1">{formatCurrency(cashflow.waiterRevenue)}</p>
                  <p className="text-sm text-amber-600/70 mb-4">{cashflow.waiterCount} waiter orders processed</p>
                  <p className="text-sm max-w-md text-center">
                    Cash flow from all orders handled by waitstaff. View detailed breakdown in
                    the Reports section.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="butcher" className="mt-6">
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                    <Beef className="h-10 w-10 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-700 mb-1">{formatCurrency(cashflow.butcherRevenue)}</p>
                  <p className="text-sm text-red-600/70 mb-4">{cashflow.butcherCount} meat items sold</p>
                  <p className="text-sm max-w-md text-center">
                    Cash flow from all meat item sales processed through the butcher department.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="bartender" className="mt-6">
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                    <Coffee className="h-10 w-10 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mb-1">{formatCurrency(cashflow.bartenderRevenue)}</p>
                  <p className="text-sm text-emerald-600/70 mb-4">{cashflow.bartenderCount} drinks sold</p>
                  <p className="text-sm max-w-md text-center">
                    Cash flow from all drink and beverage sales handled by the bartender.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
