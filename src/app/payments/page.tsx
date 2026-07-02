"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CreditCard, Inbox, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentsPage() {
  const stats = [
    { label: "Today's Revenue", value: "$0.00", icon: DollarSign, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
    { label: "Card Payments", value: "0", icon: CreditCard, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Total Tips", value: "$0.00", icon: ArrowUpRight, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Refunds Today", value: "0", icon: ArrowDownRight, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
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
            <p className="text-sm text-muted-foreground">Process and manage payments</p>
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
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All Payments</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No payments yet</p>
                  <p className="text-sm">Payments will appear here once processed</p>
                </div>
              </TabsContent>
              <TabsContent value="pending" className="mt-6">
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <CreditCard className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No pending payments</p>
                  <p className="text-sm">Pending payments will appear here</p>
                </div>
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <CreditCard className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No completed payments</p>
                  <p className="text-sm">Completed payments will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
