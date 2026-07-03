"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Clock, History, User, ShoppingBag, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { EthiopianCornerSet } from "@/components/shared/ethiopian-patterns";

export default function ClientDashboard() {
  const { t } = useTranslation();
  const stats = [
    { label: t("dashboard.activeTables"), value: "0", icon: Clock, color: "from-ethiopian-gold to-ethiopian-coffee", bgColor: "bg-ethiopian-gold/10", iconColor: "text-ethiopian-gold" },
    { label: t("dashboard.totalOrders"), value: "0", icon: ShoppingBag, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Loyalty Points", value: "0", icon: UtensilsCrossed, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", iconColor: "text-amber-600" },
  ];
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-ethiopian-coffee">
            Customer Portal
          </h1>
          <p className="text-ethiopian-coffee/60 mt-1">Browse menu, place orders, and track your orders</p>
        </div>
        <Button variant="outline" className="gap-2 border-ethiopian-gold/20 text-ethiopian-coffee">
          <User className="h-4 w-4" />
          My Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
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
                <p className="text-xs lg:text-sm text-ethiopian-coffee/60 font-medium mb-1">{s.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight text-ethiopian-coffee">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Browse Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("menu.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button className="w-full" asChild>
                <a href="/menu">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Full Menu
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium mb-1">{t("orders.noOrders")}</p>
                <p className="text-sm">Your order history will appear here</p>
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
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium mb-1">No active orders</p>
              <p className="text-sm">Track your current orders here</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
