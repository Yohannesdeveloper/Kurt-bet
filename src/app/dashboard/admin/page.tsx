"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ChefHat, ClipboardList, DollarSign, Settings, BarChart3, Shield, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

const adminActions = [
  { label: "Manage Employees", icon: Users, href: "/employees", description: "Add, edit, or remove staff members" },
  { label: "View Reports", icon: BarChart3, href: "/reports", description: "Analytics and performance metrics" },
  { label: "Settings", icon: Settings, href: "/settings", description: "Configure system settings" },
  { label: "Inventory", icon: ClipboardList, href: "/inventory", description: "Manage stock and supplies" },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const stats = [
    { label: t("dashboard.totalRevenue"), value: "$0.00", icon: DollarSign, color: "from-[#C89B3C] to-[#3E2723]", bgColor: "bg-[#C89B3C]/10", iconColor: "text-[#C89B3C]" },
    { label: t("dashboard.totalOrders"), value: "0", icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Active Users", value: "0", icon: Users, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Kitchen Queue", value: "0", icon: ChefHat, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Full control over restaurant operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Admin Access</span>
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
                  <TrendingUp className="h-4 w-4 text-[#C89B3C]" />
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
                <Shield className="h-5 w-5" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-primary/30 transition-all duration-300"
                    asChild
                  >
                    <a href={action.href}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <action.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold">{action.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">{action.description}</p>
                    </a>
                  </Button>
                ))}
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
              <CardTitle>Quick Actions</CardTitle>
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
                    <Users className="h-4 w-4" />
                    Manage Tables
                  </a>
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" asChild>
                  <a href="/menu">
                    <ClipboardList className="h-4 w-4" />
                    Edit Menu
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
