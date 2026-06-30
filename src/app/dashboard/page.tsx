"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ClipboardList, Clock, DollarSign, Inbox, ArrowUpRight, Activity, Users, ChefHat } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Today's Revenue", value: "$0.00", icon: DollarSign, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
  { label: "Orders Today", value: "0", icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
  { label: "Active Tables", value: "0 / 0", icon: TrendingUp, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
  { label: "Avg Prep Time", value: "--", icon: Clock, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
];

const quickActions = [
  { label: "New Order", icon: ClipboardList, href: "/orders", color: "bg-gradient-to-br from-primary to-emerald-500" },
  { label: "View Tables", icon: Users, href: "/tables", color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
  { label: "Kitchen", icon: ChefHat, href: "/kds", color: "bg-gradient-to-br from-amber-500 to-orange-500" },
  { label: "Menu", icon: Activity, href: "/menu", color: "bg-gradient-to-br from-purple-500 to-violet-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's today's overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
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
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl ${s.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${s.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="font-medium">Live</span>
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{s.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold">Recent Orders</h2>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">View all</button>
              </div>
              <div className="flex flex-col items-center justify-center py-12 lg:py-16 text-muted-foreground">
                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="h-7 w-7 lg:h-8 lg:w-8" />
                </div>
                <p className="font-medium mb-1 text-sm lg:text-base">No orders yet today</p>
                <p className="text-xs lg:text-sm">Orders will appear here once placed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center justify-center p-3 lg:p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
                  >
                    <div className={`h-9 w-9 lg:h-10 lg:w-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                    <span className="text-xs lg:text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
