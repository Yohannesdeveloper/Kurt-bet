"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  Beef,
  Coffee,
  User,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

const BUTCHER_KEYWORDS = ["tibs", "kurt", "kitfo", "dulet", "tere sega", "gored gored", "awaze tibs", "zilzil tibs", "shekla tibs", "lamb tibs"];
const DRINK_KEYWORDS = ["coffee", "macchiato", "tej", "tella", "tea", "spris", "juice", "ambo", "soft drink", "besso", "atmet", "halwa", "cheesecake", "atayef"];

function isButcherItem(name: string): boolean {
  return BUTCHER_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
}
function isDrinkItem(name: string): boolean {
  return DRINK_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
}

function OrderItemList({ items }: { items: any[] }) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {items.slice(0, 20).map((item: any, i: number) => (
        <div key={i} className="flex justify-between text-xs text-ethiopian-coffee/70 py-0.5">
          <span>×{item.quantity || 1} {item.name}</span>
          <span>{formatCurrency(item.totalPrice || item.unitPrice * (item.quantity || 1))}</span>
        </div>
      ))}
      {items.length > 20 && <p className="text-xs text-ethiopian-coffee/50">...and {items.length - 20} more</p>}
    </div>
  );
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const [waiterRevenue, setWaiterRevenue] = useState(0);
  const [waiterCount, setWaiterCount] = useState(0);
  const [butcherRevenue, setButcherRevenue] = useState(0);
  const [butcherCount, setButcherCount] = useState(0);
  const [bartenderRevenue, setBartenderRevenue] = useState(0);
  const [bartenderCount, setBartenderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) router.replace("/dashboard");
  }, [session, status, router]);
  if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) return null;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/cashflow");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const s = json.data.summary;
            setRevenue(s.totalRevenue);
            setWaiterRevenue(s.waiterRevenue);
            setWaiterCount(s.waiterCount);
            setButcherRevenue(s.butcherRevenue);
            setButcherCount(s.butcherCount);
            setBartenderRevenue(s.bartenderRevenue);
            setBartenderCount(s.bartenderCount);
            setRecentOrders((json.data.transactions.waiter || []).slice(0, 10));
          }
        }
      } catch {}
      setLoadingData(false);
    }
    fetchData();
  }, []);

  const netProfit = revenue - expenses;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 shadow-lg hover:from-ethiopian-gold/30 hover:to-ethiopian-clay/30 transition-all duration-200"
          >
            <ArrowLeft className="h-6 w-6 text-ethiopian-gold" />
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Cash flow breakdown by department
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" className="h-11">
            <FileText className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </motion.div>

      {/* Department cash flow cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{waiterCount} orders</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Waiters Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(waiterRevenue)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Beef className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{butcherCount} items</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Butcher Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(butcherRevenue)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-400/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Coffee className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">{bartenderCount} items</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Bartender Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(bartenderRevenue)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-emerald-600 font-medium mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-700">{formatCurrency(revenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 font-medium mb-1 flex items-center gap-2">Total Expenses</p>
            <p className="text-3xl font-bold text-red-700">{formatCurrency(expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Net Profit</p>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(netProfit)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Department detail tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <Tabs defaultValue="waiters">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="waiters" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <User className="h-4 w-4" /> Waiters
                </TabsTrigger>
                <TabsTrigger value="butcher" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <Beef className="h-4 w-4" /> Butcher
                </TabsTrigger>
                <TabsTrigger value="bartender" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                  <Coffee className="h-4 w-4" /> Bartender
                </TabsTrigger>
              </TabsList>

              <TabsContent value="waiters" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-500" />
                      Waiters — Order Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600 mb-4">{formatCurrency(waiterRevenue)}</div>
                    <p className="text-sm text-muted-foreground mb-4">{waiterCount} orders processed</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider">Recent Orders</p>
                      {recentOrders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                          <div>
                            <span className="text-sm font-medium text-ethiopian-coffee">#{o.orderNumber}</span>
                            <span className="text-xs text-ethiopian-coffee/50 ml-2 flex items-center gap-1"><Clock className="h-3 w-3" />{o.status}</span>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(o.total || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="butcher" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Beef className="h-5 w-5 text-red-500" />
                      Butcher — Meat Item Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 mb-4">{formatCurrency(butcherRevenue)}</div>
                    <p className="text-sm text-muted-foreground mb-4">{butcherCount} meat items ordered</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider">Meat Items from Orders</p>
                      {recentOrders.filter((o: any) => (o.items || []).some((i: any) => isButcherItem(i.name))).map((o: any) => (
                        <div key={o.id} className="p-2 rounded-lg bg-red-50/50 border border-red-100">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-ethiopian-coffee">#{o.orderNumber}</span>
                            <span className="text-sm font-semibold text-red-600">
                              {formatCurrency((o.items || []).filter((i: any) => isButcherItem(i.name)).reduce((s: number, i: any) => s + (i.totalPrice || i.unitPrice * (i.quantity || 1)), 0))}
                            </span>
                          </div>
                          <OrderItemList items={(o.items || []).filter((i: any) => isButcherItem(i.name))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bartender" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-emerald-500" />
                      Bartender — Drink Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 mb-4">{formatCurrency(bartenderRevenue)}</div>
                    <p className="text-sm text-muted-foreground mb-4">{bartenderCount} drinks ordered</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider">Drink Items from Orders</p>
                      {recentOrders.filter((o: any) => (o.items || []).some((i: any) => isDrinkItem(i.name))).map((o: any) => (
                        <div key={o.id} className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-ethiopian-coffee">#{o.orderNumber}</span>
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency((o.items || []).filter((i: any) => isDrinkItem(i.name)).reduce((s: number, i: any) => s + (i.totalPrice || i.unitPrice * (i.quantity || 1)), 0))}
                            </span>
                          </div>
                          <OrderItemList items={(o.items || []).filter((i: any) => isDrinkItem(i.name))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
