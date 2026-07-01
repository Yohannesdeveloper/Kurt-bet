"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, CreditCard, Clock, Plus, Table, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "My Tables", value: "0", icon: Table, color: "from-[#C89B3C] to-[#3E2723]", bgColor: "bg-[#C89B3C]/10", iconColor: "text-[#C89B3C]" },
  { label: "Active Orders", value: "0", icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
  { label: "Payments Pending", value: "0", icon: CreditCard, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
  { label: "Orders Completed", value: "0", icon: CheckCircle, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
];

export default function WaiterDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Waiter Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage tables, orders, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Waiter Access</span>
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
                    Create New Order
                  </a>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <a href="/tables">
                    <Table className="h-4 w-4" />
                    View Tables
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mb-4 opacity-50" />
                <p className="font-medium mb-1">No recent orders</p>
                <p className="text-sm">Your recent orders will appear here</p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="/orders">
                  View All Orders
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              My Assigned Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium mb-1">No tables assigned</p>
              <p className="text-sm">Contact admin to get table assignments</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
