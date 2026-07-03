"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ChefHat, ClipboardList, DollarSign, Settings, BarChart3, Shield, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { EthiopianCornerSet } from "@/components/shared/ethiopian-patterns";

const adminActions = [
  { label: "Manage Employees", icon: Users, href: "/employees", description: "Add, edit, or remove staff members" },
  { label: "View Reports", icon: BarChart3, href: "/reports", description: "Analytics and performance metrics" },
  { label: "Settings", icon: Settings, href: "/settings", description: "Configure system settings" },
  { label: "Inventory", icon: ClipboardList, href: "/inventory", description: "Manage stock and supplies" },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const stats = [
    { label: t("dashboard.totalRevenue"), value: "$0.00", icon: DollarSign, color: "from-ethiopian-gold to-ethiopian-coffee", bgColor: "bg-ethiopian-gold/10", iconColor: "text-ethiopian-gold" },
    { label: t("dashboard.totalOrders"), value: "0", icon: ClipboardList, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Active Users", value: "0", icon: Users, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Kitchen Queue", value: "0", icon: ChefHat, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-ethiopian-coffee">
            Admin Dashboard
          </h1>
          <p className="text-ethiopian-coffee/60 mt-1">Full control over restaurant operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-ethiopian-gold" />
          <span className="text-sm font-medium text-ethiopian-coffee">Admin Access</span>
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
                  <TrendingUp className="h-4 w-4 text-ethiopian-gold" />
                </div>
                <p className="text-xs lg:text-sm text-ethiopian-coffee/60 font-medium mb-1">{s.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight text-ethiopian-coffee">{s.value}</p>
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
              <CardTitle className="flex items-center gap-2 font-serif text-ethiopian-coffee">
                <Shield className="h-5 w-5 text-ethiopian-gold" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 border-ethiopian-gold/20 hover:border-ethiopian-gold/40 transition-all duration-300"
                    asChild
                  >
                    <a href={action.href}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-ethiopian-gold/10 flex items-center justify-center">
                          <action.icon className="h-4 w-4 text-ethiopian-gold" />
                        </div>
                        <span className="font-semibold text-ethiopian-coffee">{action.label}</span>
                      </div>
                      <p className="text-xs text-ethiopian-coffee/60 text-left">{action.description}</p>
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
