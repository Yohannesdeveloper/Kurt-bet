"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Coffee, DollarSign, TrendingUp, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function BartenderDashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [revenue, setRevenue] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch("/api/cashflow?employee=bartender");
        const data = await res.json();
        if (data.success) {
          setRevenue(data.data.summary.bartenderRevenue);
          setItemCount(data.data.summary.bartenderCount);
          setTransactions(data.data.transactions || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchCashflow();
  }, []);

  if (role !== "ADMIN" && role !== "WAITER") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-ethiopian-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ethiopian-coffee">Access Denied</h2>
          <p className="text-ethiopian-coffee/60 mt-2">Admin or Waiter access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-lg"
          >
            <Coffee className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-serif text-ethiopian-coffee">
              Bartender Dashboard
            </h1>
            <p className="text-ethiopian-coffee/60 mt-1">
              Drink sales and cashflow overview
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200/50 hover:border-emerald-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Bartender Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(revenue)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200/50 hover:border-emerald-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Drinks Sold</p>
              <p className="text-3xl font-bold tracking-tight">{itemCount}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200/50 hover:border-emerald-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Orders with Drinks</p>
              <p className="text-3xl font-bold tracking-tight">{transactions.length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2 border-emerald-200/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold font-serif text-ethiopian-coffee mb-4 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-emerald-500" />
              Drink Transactions
            </h2>
            {loading ? (
              <div className="text-center py-12 text-ethiopian-coffee/60">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-ethiopian-gold mx-auto mb-3" />
                <p className="text-ethiopian-coffee/60">No drink transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ethiopian-coffee">#{tx.orderNumber}</span>
                        <span className="text-xs text-emerald-600 font-medium">
                          {(tx.items || []).length} drink(s)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(tx.items || []).slice(0, 3).map((item: any, i: number) => (
                          <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            x{item.quantity || 1} {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(tx.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
