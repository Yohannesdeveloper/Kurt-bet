"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, CheckCircle, AlertCircle, Flame, Timer } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Pending Orders", value: "0", icon: Clock, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
  { label: "In Progress", value: "0", icon: Flame, color: "from-orange-500 to-red-600", bgColor: "bg-orange-500/10", iconColor: "text-orange-600" },
  { label: "Ready to Serve", value: "0", icon: CheckCircle, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
  { label: "Completed Today", value: "0", icon: Timer, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
];

const orderStatuses = [
  { status: "NEW", label: "New Orders", count: 0, color: "bg-amber-500" },
  { status: "PREPARING", label: "Preparing", count: 0, color: "bg-orange-500" },
  { status: "READY", label: "Ready", count: 0, color: "bg-emerald-500" },
  { status: "COMPLETED", label: "Completed", count: 0, color: "bg-blue-500" },
];

export default function KitchenDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Kitchen Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage incoming orders and kitchen queue</p>
        </div>
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Kitchen Staff</span>
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
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{s.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{s.value}</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Order Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {orderStatuses.map((status) => (
                <div key={status.status} className="text-center">
                  <div className={`h-12 w-12 rounded-full ${status.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold text-lg">{status.count}</span>
                  </div>
                  <p className="text-sm font-medium">{status.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ChefHat className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium mb-1">No orders in queue</p>
              <p className="text-sm">New orders will appear here</p>
            </div>
            <Button className="w-full mt-4" asChild>
              <a href="/kds">
                <ChefHat className="h-4 w-4 mr-2" />
                Open Kitchen Display System
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <a href="/kds">
                  <Clock className="h-4 w-4" />
                  View All Orders
                </a>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <a href="/menu">
                  <CheckCircle className="h-4 w-4" />
                  View Menu
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
