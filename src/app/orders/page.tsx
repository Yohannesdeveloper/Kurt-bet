"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Plus, Filter, Inbox, Minus, X, Loader2, ShoppingCart, Check, Clock, UtensilsCrossed, ChefHat, MapPin, Users, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

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
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const canApprove = userRole === "ADMIN" || userRole === "WAITER";
  const canCreateOrder = userRole === "ADMIN" || userRole === "WAITER";
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
      // demo fallback
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
        toast.success(approve ? "Order approved and sent to kitchen" : "Order unapproved");
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
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage all orders</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 lg:h-11 w-10 lg:w-11 flex-shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
          {canCreateOrder && (
            <Button
              variant="premium"
              onClick={() => setDialogOpen(true)}
              className="h-10 lg:h-11 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> New Order
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="border-2">
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All Orders</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Pending Approval</TabsTrigger>
              <TabsTrigger value="NEW" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">New</TabsTrigger>
              <TabsTrigger value="PREPARING" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Preparing</TabsTrigger>
              <TabsTrigger value="READY" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Ready</TabsTrigger>
              <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No orders yet</p>
                  <p className="text-sm mb-6">Orders will appear here once placed</p>
                  {canCreateOrder && (
                    <Button
                      variant="premium"
                      onClick={() => setDialogOpen(true)}
                      className="h-11"
                    >
                      <Plus className="h-4 w-4 mr-2" /> New Order
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
                      canApprove={canApprove}
                      onApprove={handleApprove}
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

function OrderCard({ order, index, canApprove, onApprove }: {
  order: Order;
  index: number;
  canApprove: boolean;
  onApprove: (id: string, approve: boolean) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

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
          {/* Image header */}
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
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    {order.type.replace("_", " ")} · {order.guestCount} {order.guestCount === 1 ? "guest" : "guests"}
                    {order.table && ` · ${order.table.name || `Table ${order.table.number}`}`}
                  </p>
                </div>
                <Badge className={approvedBadge(order.approved)}>
                  {order.approved ? "Approved" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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

          {/* Actions */}
          {canApprove && (
            <div className="px-4 pb-4 pt-0">
              <Button
                variant={order.approved ? "outline" : "default"}
                size="sm"
                onClick={(e) => { e.stopPropagation(); onApprove(order.id, !order.approved); }}
                className={`w-full h-8 text-xs ${order.approved ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
              >
                {order.approved ? "Unapprove" : "Approve"}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      <OrderDetailDialog
        order={order}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

function OrderDetailDialog({ order, open, onClose }: { order: Order; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center shadow-md">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">Order #{order.orderNumber}</DialogTitle>
              <DialogDescription>
                {new Date(order.createdAt).toLocaleString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusStyles[order.status] || ""}>{order.status}</Badge>
            <Badge className={approvedBadge(order.approved)}>
              {order.approved ? "Approved" : "Pending Approval"}
            </Badge>
          </div>

          {/* Order info */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F8F4EE]">
            <div>
              <p className="text-xs text-[#3E2723]/50">Type</p>
              <p className="text-sm font-semibold text-[#3E2723]">{order.type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs text-[#3E2723]/50">Guests</p>
              <p className="text-sm font-semibold text-[#3E2723]">{order.guestCount}</p>
            </div>
            {order.table && (
              <div>
                <p className="text-xs text-[#3E2723]/50">Table</p>
                <p className="text-sm font-semibold text-[#3E2723]">{order.table.name || `Table ${order.table.number}`}</p>
              </div>
            )}
            {order.waiter && (
              <div>
                <p className="text-xs text-[#3E2723]/50">Waiter</p>
                <p className="text-sm font-semibold text-[#3E2723]">{order.waiter.firstName} {order.waiter.lastName}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-sm font-semibold text-[#3E2723] mb-2">Items ({order.items.length})</p>
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
                  <p className="text-sm font-semibold text-[#C89B3C]">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-[#3E2723] to-[#1B1B1B] text-white">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">{formatCurrency(order.total)}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium text-amber-800 flex items-center gap-1 mb-1">
                <FileText className="h-3.5 w-3.5" />
                Notes
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
    if (cart.length === 0) { toast.error("Add at least one item"); return; }
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
        toast.success(`Order #${data.data.orderNumber} created`);
        onOpenChange(false);
        onOrderCreated(data.data);
      } else {
        toast.error(data.error || "Failed to create order");
      }
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "setup" ? "New Order" : step === "items" ? "Add Items" : "Review Order"}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" ? "Configure order details" : step === "items" ? "Search and add menu items" : "Review and confirm the order"}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" && (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DINE_IN">Dine In</SelectItem>
                  <SelectItem value="TAKEOUT">Takeout</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === "DINE_IN" && (
              <div className="grid gap-2">
                <Label>Table</Label>
                <Select value={tableId} onValueChange={setTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name || `Table ${t.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Guest Count</Label>
              <Input type="number" min={1} value={guestCount} onChange={e => setGuestCount(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="flex h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                placeholder="Any special instructions..."
              />
            </div>
          </div>
        )}

        {step === "items" && (
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredItems.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No menu items found</p>
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
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">{cart.reduce((s, c) => s + c.quantity, 0)} items</p>
              <p className="font-semibold">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{orderType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Guests</p>
                <p className="font-medium">{guestCount}</p>
              </div>
              {tableId && (
                <div>
                  <p className="text-muted-foreground">Table</p>
                  <p className="font-medium">{tables.find(t => t.id === tableId)?.name || `Table ${tables.find(t => t.id === tableId)?.number}`}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Items ({cart.reduce((s, c) => s + c.quantity, 0)})</p>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {item.image && <img src={item.image} alt="" className="h-7 w-7 rounded object-cover" />}
                      {item.name} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
            </div>

            {notes && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground">Notes: {notes}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step !== "setup" && (
              <Button variant="ghost" onClick={() => setStep(step === "items" ? "setup" : "items")}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === "setup" && (
              <Button onClick={() => setStep("items")}>
                Next: Add Items
              </Button>
            )}
            {step === "items" && (
              <Button onClick={() => setStep("review")} disabled={cart.length === 0}>
                Review Order
              </Button>
            )}
            {step === "review" && (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Creating...</>
                ) : (
                  <><Check className="h-4 w-4 mr-1" /> Place Order</>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
