"use client";

import { useEffect } from "react";
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
  TrendingDown,
  DollarSign,
  Inbox,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) router.replace("/dashboard");
  }, [session, status, router]);
  if (status !== "loading" && (!session || (session.user as any)?.role !== "ADMIN")) return null;
  const stats = [
    { label: "Total Revenue", value: formatCurrency(0), icon: TrendingUp, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
    { label: "Total Expenses", value: formatCurrency(0), icon: TrendingDown, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
    { label: "Net Profit", value: formatCurrency(0), icon: DollarSign, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
  ];

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
              Generate and export detailed reports
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <Tabs defaultValue="financial">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Financial</TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Sales</TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Inventory</TabsTrigger>
                <TabsTrigger value="employees" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Employees</TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Inbox className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No report data yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Financial data will appear here once reports are generated.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Sales Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Sales reports will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Inbox className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Inventory Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Inventory reports will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employees" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Inbox className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Employee Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Employee performance reports will be available here.
                    </p>
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
