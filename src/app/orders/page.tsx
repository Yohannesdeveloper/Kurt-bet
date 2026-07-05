"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Plus, Filter, Inbox, Minus, X, Loader2, ShoppingCart, Check, Clock, UtensilsCrossed, ChefHat, MapPin, Users, FileText, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/store/useNotificationStore";

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  DELAYED: "bg-red-100 text-red-700",
};

const approvedBadge = (approved: boolean) =>
  approved
    ? "bg-emerald-100 text-emerald-700"
    : "bg-yellow-100 text-yellow-700";

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  approved: boolean;
  type: string;
  guestCount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  table: { number: number; name: string | null } | null;
  waiter: { firstName: string; lastName: string } | null;
  items: { id: string; name: string; quantity: number; totalPrice: number; menuItem?: { image?: string } | null }[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image?: string;
  isAvailable?: boolean;
  requiresButcher?: boolean;
}

interface TableOption {
  id: string;
  number: number;
  name: string | null;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  image?: string;
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const canApprove = userRole === "ADMIN" || userRole === "WAITER";
  const canCreateOrder = userRole === "ADMIN" || userRole === "WAITER" || userRole === "CLIENT";
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === "pending" ? "all" : activeTab;
      const approvedParam = activeTab === "pending" ? "false" : "";
      const url = `/api/orders?status=${statusParam}${approvedParam ? `&approved=${approvedParam}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useSocket();
  const { notifications } = useNotificationStore();
  useEffect(() => {
    const readyNotif = notifications.find(n => n.type === "ORDER_READY" && !n.isRead);
    if (readyNotif) {
      toast.success(readyNotif.message, { duration: 5000, icon: "🍽️" });
      useNotificationStore.getState().markAsRead(readyNotif.id);
    }
  }, [notifications]);

  const handleApprove = async (orderId: string, approve: boolean) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, approved: approve } : o));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approve }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("orders.approvedToast"));
        fetchOrders();
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, approved: !approve } : o));
    }
  };

  const filtered = orders.filter(o =>
    o.orderNumber.toString().includes(searchQuery) ||
    o.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 shadow-lg hover:from-ethiopian-gold/30 hover:to-ethiopian-clay/30 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-ethiopian-gold" />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight font-serif text-ethiopian-coffee">{t("orders.title")}</h1>
            <p className="text-sm text-ethiopian-coffee/60">{t("orders.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ethiopian-coffee/40" />
            <Input
              placeholder={t("orders.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72 border-ethiopian-gold/20 focus:border-ethiopian-gold/40"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 lg:h-11 w-10 lg:w-11 flex-shrink-0 border-ethiopian-gold/20 text-ethiopian-coffee">
            <Filter className="h-4 w-4" />
          </Button>
          {canCreateOrder && (
            <Button
              variant="premium"
              onClick={() => setDialogOpen(true)}
              className="h-10 lg:h-11 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("orders.newOrder")}
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="border border-ethiopian-gold/10">
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-ethiopian-gold/5 border border-ethiopian-gold/10 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.allOrders")}</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.pendingApproval")}</TabsTrigger>
              <TabsTrigger value="NEW" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.statusNew")}</TabsTrigger>
              <TabsTrigger value="PREPARING" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.statusPreparing")}</TabsTrigger>
              <TabsTrigger value="READY" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.statusReady")}</TabsTrigger>
              <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("orders.statusCompleted")}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">{t("orders.loading")}</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold mb-2">{t("orders.noOrders")}</p>
                  <p className="text-sm mb-6">{t("orders.noOrdersSubtitle")}</p>
                  {canCreateOrder && (
                    <Button
                      variant="premium"
                      onClick={() => setDialogOpen(true)}
                      className="h-11"
                    >
                      <Plus className="h-4 w-4 mr-2" /> {t("orders.newOrder")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {filtered.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      isAdmin={isAdmin}
                      canApprove={canApprove}
                      onApprove={handleApprove}
                      onDelete={(id) => setOrders(prev => prev.filter(o => o.id !== id))}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <NewOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} onOrderCreated={(order: Order) => {
        setOrders(prev => [order, ...prev]);
      }} />
    </div>
  );
}

function OrderCard({ order, index, isAdmin, canApprove, onApprove, onDelete }: {
  order: Order;
  index: number;
  isAdmin: boolean;
  canApprove: boolean;
  onApprove: (id: string, approve: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this order?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Order deleted");
        onDelete(order.id);
      } else {
        toast.error(data.error || "Failed to delete order");
      }
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          onClick={() => setDetailOpen(true)}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-[#C89B3C]/30 cursor-pointer relative overflow-hidden"
        >
          <div className="relative w-full h-40 overflow-hidden bg-muted">
            {order.items[0]?.menuItem?.image ? (
              <img
                src={order.items[0].menuItem.image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3E2723] to-[#C89B3C]/30">
                <UtensilsCrossed className="h-10 w-10 text-[#C89B3C]" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg text-white drop-shadow-sm">#{order.orderNumber}</p>
                    <Badge className={`${statusStyles[order.status] || ""} text-[10px] px-1.5 py-0`}>
                      {t(`orders.status${order.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    {t(`orders.type${order.type}`)} · {order.guestCount} {t("orders.guest", { count: order.guestCount })}
                    {order.table && ` · ${order.table.name || t("orders.tableNumber", { number: order.table.number })}`}
                  </p>
                </div>
                <Badge className={approvedBadge(order.approved)}>
                  {order.approved ? t("orders.approved") : t("orders.pending")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("orders.itemsCount", { count: order.items.length })}
              </p>
              <p className="font-bold text-base">{formatCurrency(order.total)}</p>
            </div>
            {order.waiter && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ChefHat className="h-3 w-3" />
                {order.waiter.firstName} {order.waiter.lastName}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {canApprove && (
            <div className="px-4 pb-4 pt-0 flex gap-2">
              <Button
                variant={order.approved ? "outline" : "default"}
                size="sm"
                onClick={(e) => { e.stopPropagation(); onApprove(order.id, !order.approved); }}
                className={`flex-1 h-8 text-xs ${order.approved ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
              >
                {order.approved ? t("orders.unapprove") : t("orders.approve")}
              </Button>
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-50"
                  title="Delete order"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      <OrderDetailDialog
        order={order}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}

function OrderDetailDialog({ order, open, onClose, isAdmin }: { order: Order; open: boolean; onClose: () => void; isAdmin: boolean }) {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteItem = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeItemId: itemId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item removed from order");
        onClose();
      } else {
        toast.error(data.error || "Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center shadow-md">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t("orders.orderDetailTitle", { number: order.orderNumber })}</DialogTitle>
              <DialogDescription>
                {new Date(order.createdAt).toLocaleString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusStyles[order.status] || ""}>{t(`orders.status${order.status}`)}</Badge>
            <Badge className={approvedBadge(order.approved)}>
              {order.approved ? t("orders.approved") : t("orders.pendingApproval")}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F8F4EE]">
            <div>
              <p className="text-xs text-[#3E2723]/50">{t("orders.type")}</p>
              <p className="text-sm font-semibold text-[#3E2723]">{t(`orders.type${order.type}`)}</p>
            </div>
            <div>
              <p className="text-xs text-[#3E2723]/50">{t("orders.guests")}</p>
              <p className="text-sm font-semibold text-[#3E2723]">{order.guestCount}</p>
            </div>
            {order.table && (
              <div>
                <p className="text-xs text-[#3E2723]/50">{t("orders.table")}</p>
                <p className="text-sm font-semibold text-[#3E2723]">{order.table.name || t("orders.tableNumber", { number: order.table.number })}</p>
              </div>
            )}
            {order.waiter && (
              <div>
                <p className="text-xs text-[#3E2723]/50">{t("orders.waiter")}</p>
                <p className="text-sm font-semibold text-[#3E2723]">{order.waiter.firstName} {order.waiter.lastName}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#3E2723] mb-2">{t("orders.items", { count: order.items.length })}</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100">
                  {item.menuItem?.image ? (
                    <img src={item.menuItem.image} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="h-5 w-5 text-[#C89B3C]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E2723]">{item.name}</p>
                    <p className="text-xs text-[#3E2723]/50">x{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#C89B3C]">{formatCurrency(item.totalPrice)}</p>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-50"
                      >
                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-[#3E2723] to-[#1B1B1B] text-white">
            <span className="text-sm font-medium">{t("orders.total")}</span>
            <span className="text-lg font-bold">{formatCurrency(order.total)}</span>
          </div>

          {order.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium text-amber-800 flex items-center gap-1 mb-1">
                <FileText className="h-3.5 w-3.5" />
                {t("orders.notes")}
              </p>
              <p className="text-sm text-amber-900">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewOrderDialog({ open, onOpenChange, onOrderCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onOrderCreated: (order: Order) => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"setup" | "items" | "review">("setup");
  const [submitting, setSubmitting] = useState(false);

  const [tables, setTables] = useState<TableOption[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [tableId, setTableId] = useState("");
  const [orderType, setOrderType] = useState("DINE_IN");
  const [guestCount, setGuestCount] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("setup");
      setCart([]);
      setTableId("");
      setOrderType("DINE_IN");
      setGuestCount("1");
      setNotes("");
      return;
    }
    fetch("/api/tables").then(r => r.json()).then(d => {
      if (d.success) setTables(d.data);
    }).catch(() => {});
    fetch("/api/menu").then(r => r.json()).then(d => {
      if (d.success) setMenuItems(d.data.items || []);
    }).catch(() => {});
  }, [open]);

  const filteredItems = menuItems.filter(i =>
    i.name.toLowerCase().includes(menuSearch.toLowerCase()) && i.isAvailable !== false
  );

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.menuItemId === item.id
          ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice }
          : c
      ));
    } else {
      setCart([...cart, {
        id: `cart-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.price,
        totalPrice: item.price,
        quantity: 1,
        image: item.image,
      }]);
    }
  };

  const updateQty = (menuItemId: string, delta: number) => {
    setCart(cart.map(c =>
      c.menuItemId === menuItemId
        ? { ...c, quantity: Math.max(0, c.quantity + delta), totalPrice: Math.max(0, c.quantity + delta) * c.unitPrice }
        : c
    ).filter(c => c.quantity > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.totalPrice, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error(t("orders.addItemError")); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableId || undefined,
          type: orderType,
          guestCount: parseInt(guestCount) || 1,
          notes: notes || undefined,
          subtotal,
          total: subtotal,
          items: cart.map(c => ({
            menuItemId: c.menuItemId,
            name: c.name,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            totalPrice: c.totalPrice,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const order = data.data;
        const table = tables.find(t => t.id === tableId);
        // Create butcher orders for any items that require butcher processing
        for (const cartItem of cart) {
          const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
          if (menuItem?.requiresButcher) {
            await fetch("/api/butcher-orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                menuItemName: cartItem.name,
                quantity: cartItem.quantity,
                tableNumber: table?.number?.toString() || null,
              }),
            });
          }
        }
        toast.success(t("orders.created", { orderNumber: order.orderNumber }));
        onOpenChange(false);
        onOrderCreated(order);
      } else {
        toast.error(data.error || t("orders.createFailed"));
      }
    } catch {
      toast.error(t("orders.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "setup" ? t("orders.newOrder") : step === "items" ? t("orders.addItems") : t("orders.reviewOrder")}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" ? t("orders.setupDescription") : step === "items" ? t("orders.itemsDescription") : t("orders.reviewDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" && (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>{t("orders.orderType")}</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DINE_IN">{t("orders.dineIn")}</SelectItem>
                  <SelectItem value="TAKEOUT">{t("orders.takeout")}</SelectItem>
                  <SelectItem value="DELIVERY">{t("orders.delivery")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === "DINE_IN" && (
              <div className="grid gap-2">
                <Label>{t("orders.table")}</Label>
                <Select value={tableId} onValueChange={setTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("orders.selectTable")} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(tbl => (
                      <SelectItem key={tbl.id} value={tbl.id}>
                        {tbl.name || t("orders.tableNumber", { number: tbl.number })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>{t("orders.guestCount")}</Label>
              <Input type="number" min={1} value={guestCount} onChange={e => setGuestCount(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>{t("orders.notes")}</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="flex h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                placeholder={t("orders.notesPlaceholder")}
              />
            </div>
          </div>
        )}

        {step === "items" && (
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("orders.searchMenu")}
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredItems.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">{t("orders.noMenuItems")}</p>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cart.find(c => c.menuItemId === item.id) ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-medium">
                            {cart.find(c => c.menuItemId === item.id)?.quantity || 0}
                          </span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                          <Plus className="h-3 w-3 mr-1" /> {t("orders.add")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">{t("orders.itemsCount", { count: cart.reduce((s, c) => s + c.quantity, 0) })}</p>
              <p className="font-semibold">{formatCurrency(subtotal)}</p>
            </div>

            {cart.length > 0 && (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cart</p>
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate flex-1">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-medium w-14 text-right">{formatCurrency(item.totalPrice)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => updateQty(item.menuItemId, -item.quantity)} title="Remove">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("orders.type")}</p>
                <p className="font-medium">{t(`orders.type${orderType}`)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("orders.guests")}</p>
                <p className="font-medium">{guestCount}</p>
              </div>
              {tableId && (
                <div>
                  <p className="text-muted-foreground">{t("orders.table")}</p>
                  <p className="font-medium">{tables.find(t => t.id === tableId)?.name || t("orders.tableNumber", { number: tables.find(t => t.id === tableId)?.number || 0 })}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{t("orders.items", { count: cart.reduce((s, c) => s + c.quantity, 0) })}</p>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between text-sm gap-2">
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      {item.image && <img src={item.image} alt="" className="h-7 w-7 rounded object-cover flex-shrink-0" />}
                      <span className="truncate">{item.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-medium w-14 text-right">{formatCurrency(item.totalPrice)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => updateQty(item.menuItemId, -item.quantity)} title="Remove">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold">{t("orders.total")}</span>
              <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
            </div>

            {notes && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground">{t("orders.notesLabel", { notes })}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step !== "setup" && (
              <Button variant="ghost" onClick={() => setStep(step === "items" ? "setup" : "items")}>
                {t("common.back")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === "setup" && (
              <Button onClick={() => setStep("items")}>
                {t("orders.nextAddItems")}
              </Button>
            )}
            {step === "items" && (
              <Button onClick={() => setStep("review")} disabled={cart.length === 0}>
                {t("orders.reviewOrder")}
              </Button>
            )}
            {step === "review" && (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("orders.creating")}</>
                ) : (
                  <><Check className="h-4 w-4 mr-1" /> {t("orders.placeOrder")}</>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
