"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft, Store, Users, Loader2, CalendarCheck,
  CircleCheck, Clock, UserCheck, CalendarDays, XCircle,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface TableData {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: string;
  section: string;
  guestCount?: number;
  orders: { id: string; total: number; status: string; guestCount?: number }[];
  reservation?: { id: string; guestName: string; guestCount: number; dateTime: string; duration: number } | null;
  _count: { orders: number };
}

const statusConfig: Record<string, { color: string; icon: typeof CircleCheck; label: string; border: string; bg: string }> = {
  AVAILABLE: { color: "bg-green-100 text-green-700 border-green-200", icon: CircleCheck, label: "Available", border: "border-l-4 border-l-green-500", bg: "" },
  OCCUPIED: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: UserCheck, label: "Occupied", border: "border-l-4 border-l-amber-500", bg: "" },
  RESERVED: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CalendarDays, label: "Reserved", border: "border-l-4 border-l-blue-500", bg: "" },
  CLEANING: { color: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock, label: "Cleaning", border: "border-l-4 border-l-gray-400", bg: "" },
};

const filterOptions = [
  { key: "ALL", label: "All" },
  { key: "AVAILABLE", label: "Available" },
  { key: "OCCUPIED", label: "Occupied" },
  { key: "RESERVED", label: "Reserved" },
  { key: "CLEANING", label: "Cleaning" },
];

export default function TablesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const canReserve = userRole === "ADMIN" || userRole === "WAITER";
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchTables = () => {
    fetch("/api/tables")
      .then(r => r.json())
      .then(d => { if (d.success) setTables(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000);
    return () => clearInterval(interval);
  }, []);

  const openReserveDialog = (table: TableData) => {
    setSelectedTable(table);
    setGuestName("");
    setGuestCount(String(Math.min(2, table.capacity)));
    setReserveDialogOpen(true);
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !guestName.trim()) { toast.error("Guest name required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          guestName: guestName.trim(),
          guestCount: parseInt(guestCount) || 2,
          dateTime: new Date().toISOString(),
          duration: 120,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Table ${selectedTable.name} reserved for ${guestName}`);
        setReserveDialogOpen(false);
        fetchTables();
      } else {
        toast.error(data.error || "Failed to reserve");
      }
    } catch {
      toast.error("Failed to reserve");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreeTable = async (table: TableData) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table.id, action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${table.name} is now available`);
        fetchTables();
      } else {
        toast.error(data.error || "Failed to free table");
      }
    } catch {
      toast.error("Failed to free table");
    }
  };

  const sections = Array.from(new Set(tables.map(t => t.section)));
  const filteredTables = activeFilter === "ALL" ? tables : tables.filter(t => t.status === activeFilter);

  const occupied = tables.filter(t => t.status === "OCCUPIED").length;
  const reserved = tables.filter(t => t.status === "RESERVED").length;
  const available = tables.filter(t => t.status === "AVAILABLE").length;
  const cleaning = tables.filter(t => t.status === "CLEANING").length;

  const statusCounts: Record<string, number> = {
    ALL: tables.length,
    AVAILABLE: available,
    OCCUPIED: occupied,
    RESERVED: reserved,
    CLEANING: cleaning,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 shadow-lg hover:from-ethiopian-gold/30 hover:to-ethiopian-clay/30 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-ethiopian-gold" />
          </Link>
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
            <Store className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Tables</h1>
            <p className="text-sm text-muted-foreground">{occupied}/{tables.length} occupied</p>
          </div>
        </div>
        {tables.length > 0 && (
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs lg:text-sm font-medium text-emerald-700 dark:text-emerald-300">{available} free</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs lg:text-sm font-medium text-amber-700 dark:text-amber-300">{occupied} occupied</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300">{reserved} reserved</span>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {filterOptions.map(opt => {
          const count = statusCounts[opt.key] || 0;
          return (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeFilter === opt.key
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-white dark:bg-gray-900 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {opt.label}
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === opt.key
                  ? "bg-white/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading tables...</p>
          </div>
        </div>
      ) : tables.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Store className="h-10 w-10" />
                </div>
                <p className="text-lg font-semibold mb-2">No tables configured</p>
                <p className="text-sm">Add tables to get started with your floor plan</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        sections.map((section, sectionIndex) => {
          const sectionTables = filteredTables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;
          return (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                {sectionTables.map((table, tableIndex) => {
                  const config = statusConfig[table.status] || statusConfig.AVAILABLE;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={table.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: sectionIndex * 0.1 + tableIndex * 0.05 }}
                    >
                      <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 ${config.border}`}>
                        <CardContent className="p-4 lg:p-5">
                          <div className="flex items-center justify-between mb-2 lg:mb-3">
                            <p className="font-bold text-lg lg:text-xl">{table.name}</p>
                            <Badge
                              className={`${config.color} flex items-center gap-1`}
                              variant="outline"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground mb-2">
                            <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            <span>
                              {table.status === "OCCUPIED"
                                ? `${table.guestCount || 0}/${table.capacity}`
                                : `${table.capacity} seats`}
                            </span>
                          </div>

                          {table.status === "OCCUPIED" && table.orders.length > 0 && (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                Active order: {formatCurrency(table.orders[0].total)}
                              </p>
                            </div>
                          )}

                          {table.status === "RESERVED" && canReserve && (
                            <div className="mt-3 pt-3 border-t">
                              <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950" onClick={() => handleFreeTable(table)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Free Table
                              </Button>
                            </div>
                          )}

                          {table.status === "AVAILABLE" && canReserve && (
                            <div className="mt-3 pt-3 border-t">
                              <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950" onClick={() => openReserveDialog(table)}>
                                <CalendarCheck className="h-3.5 w-3.5 mr-1" /> Reserve
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })
      )}

      <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reserve {selectedTable?.name}</DialogTitle>
            <DialogDescription>
              Enter guest details to reserve this table
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReserve}>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="guestName" className="text-sm font-medium">Guest Name *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  required
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestCount" className="text-sm font-medium">Number of Guests</Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max={selectedTable?.capacity || 4}
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setReserveDialogOpen(false)} className="h-11">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-11">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reserving...</> : "Confirm Reservation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
