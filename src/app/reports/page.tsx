"use client";

import { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

type CashflowSummary = {
  totalRevenue: number;
  totalTransactions: number;
  totalTips?: number;
  totalItems?: number;
};

type EmployeeEntry = {
  id: string;
  name: string;
  orderCount: number;
  revenue: number;
};

type OrderEntry = {
  id?: string;
  orderNumber: number;
  total?: number;
  status?: string;
  waiter?: { firstName: string; lastName: string } | null;
  table?: { number: number } | null;
  items?: any[];
  payments?: any[];
};

type CashflowData = {
  data: {
    orders?: OrderEntry[];
    payments?: any[];
    employees?: EmployeeEntry[];
    meatItems?: { orderNumber: number; name: string; quantity: number; totalPrice: number }[];
    drinkItems?: { orderNumber: number; name: string; quantity: number; totalPrice: number }[];
  };
  summary: CashflowSummary;
};

function EmployeeBreakdown({ employees }: { employees: EmployeeEntry[] }) {
  if (!employees || employees.length === 0) return null;
  const maxRev = Math.max(...employees.map((e) => e.revenue), 1);
  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider">Per-Employee Breakdown</p>
      {employees.map((emp) => (
        <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground">{emp.orderCount} orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(emp.revenue / maxRev) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold shrink-0">{formatCurrency(emp.revenue)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTransactions({ orders }: { orders: OrderEntry[] }) {
  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider">Recent Transactions</p>
      {orders.slice(0, 10).map((o: any) => (
        <div key={o.id || o.orderNumber} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium shrink-0">#{o.orderNumber}</span>
            <span className="text-xs text-muted-foreground truncate">
              {o.waiter ? `${o.waiter.firstName} ${o.waiter.lastName}` : (o.status || "")}
            </span>
          </div>
          <span className="text-sm font-semibold shrink-0 ml-2">{formatCurrency(o.total || 0)}</span>
        </div>
      ))}
      {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No transactions found</p>}
    </div>
  );
}

function ItemDetailList({ items, label }: { items: { orderNumber: number; name: string; quantity: number; totalPrice: number }[]; label: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No {label.toLowerCase()} found</p>;
  return (
    <div className="space-y-1 max-h-64 overflow-y-auto mt-4">
      <p className="text-xs font-semibold text-ethiopian-coffee/60 uppercase tracking-wider sticky top-0 bg-background py-1">{label}</p>
      {items.slice(0, 30).map((item, i) => (
        <div key={i} className="flex justify-between text-xs text-ethiopian-coffee/70 py-0.5">
          <span className="truncate">×{item.quantity} {item.name} <span className="text-xs text-muted-foreground">(#{(item as any).orderNumber})</span></span>
          <span className="shrink-0 ml-2">{formatCurrency(item.totalPrice)}</span>
        </div>
      ))}
      {items.length > 30 && <p className="text-xs text-muted-foreground">...and {items.length - 30} more</p>}
    </div>
  );
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [waiterData, setWaiterData] = useState<CashflowData | null>(null);
  const [butcherData, setButcherData] = useState<CashflowData | null>(null);
  const [bartenderData, setBartenderData] = useState<CashflowData | null>(null);

  const [loadingWaiter, setLoadingWaiter] = useState(true);
  const [loadingButcher, setLoadingButcher] = useState(true);
  const [loadingBartender, setLoadingBartender] = useState(true);

  useEffect(() => {
    if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) router.replace("/dashboard");
  }, [session, status, router]);
  if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) return null;

  const fetchDepartment = useCallback(async (role: string) => {
    try {
      const res = await fetch(`/api/reports/cashflow?role=${role}&days=30`);
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    setLoadingWaiter(true);
    fetchDepartment("waiter").then((data) => { setWaiterData(data); setLoadingWaiter(false); });
  }, [fetchDepartment]);

  useEffect(() => {
    setLoadingButcher(true);
    fetchDepartment("butcher").then((data) => { setButcherData(data); setLoadingButcher(false); });
  }, [fetchDepartment]);

  useEffect(() => {
    setLoadingBartender(true);
    fetchDepartment("bartender").then((data) => { setBartenderData(data); setLoadingBartender(false); });
  }, [fetchDepartment]);

  const waiterSummary = waiterData?.summary ?? { totalRevenue: 0, totalTransactions: 0 };
  const butcherSummary = butcherData?.summary ?? { totalRevenue: 0, totalTransactions: 0, totalItems: 0 };
  const bartenderSummary = bartenderData?.summary ?? { totalRevenue: 0, totalTransactions: 0, totalItems: 0 };

  const totalRevenue = (waiterSummary.totalRevenue || 0);
  const totalExpenses = 0;
  const netProfit = totalRevenue - totalExpenses;

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
              Cash flow breakdown by employee department
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
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                  {loadingWaiter ? "..." : `${waiterSummary.totalTransactions} orders`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Waiters Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">
                {loadingWaiter ? <Loader2 className="h-6 w-6 animate-spin inline" /> : formatCurrency(waiterSummary.totalRevenue)}
              </p>
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
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  {loadingButcher ? "..." : `${butcherSummary.totalItems || 0} items`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Butcher Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">
                {loadingButcher ? <Loader2 className="h-6 w-6 animate-spin inline" /> : formatCurrency(butcherSummary.totalRevenue)}
              </p>
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
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                  {loadingBartender ? "..." : `${bartenderSummary.totalItems || 0} items`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Bartender Cash Flow</p>
              <p className="text-3xl font-bold tracking-tight">
                {loadingBartender ? <Loader2 className="h-6 w-6 animate-spin inline" /> : formatCurrency(bartenderSummary.totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-emerald-600 font-medium mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 font-medium mb-1 flex items-center gap-2">Total Expenses</p>
            <p className="text-3xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
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
                {loadingWaiter ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-amber-500" />
                          Waiters — Order Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-amber-600 mb-4">{formatCurrency(waiterSummary.totalRevenue)}</div>
                        <p className="text-sm text-muted-foreground mb-4">{waiterSummary.totalTransactions} orders processed</p>
                        <EmployeeBreakdown employees={waiterData?.data?.employees || []} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-500" />
                          Recent Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RecentTransactions orders={waiterData?.data?.orders || []} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="butcher" className="mt-6">
                {loadingButcher ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Beef className="h-5 w-5 text-red-500" />
                          Butcher — Meat Item Sales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600 mb-4">{formatCurrency(butcherSummary.totalRevenue)}</div>
                        <p className="text-sm text-muted-foreground mb-4">{butcherSummary.totalItems || 0} meat items sold across {butcherSummary.totalTransactions} orders</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Beef className="h-5 w-5 text-red-500" />
                          Meat Items Detail
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ItemDetailList items={butcherData?.data?.meatItems || []} label="Meat Items" />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bartender" className="mt-6">
                {loadingBartender ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Coffee className="h-5 w-5 text-emerald-500" />
                          Bartender — Drink Sales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 mb-4">{formatCurrency(bartenderSummary.totalRevenue)}</div>
                        <p className="text-sm text-muted-foreground mb-4">{bartenderSummary.totalItems || 0} drinks sold across {bartenderSummary.totalTransactions} orders</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Coffee className="h-5 w-5 text-emerald-500" />
                          Drink Items Detail
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ItemDetailList items={bartenderData?.data?.drinkItems || []} label="Drink Items" />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
