"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Search, Plus, UtensilsCrossed, Loader2, Clock, Edit, Trash2, ShoppingCart, Minus, X, Check, Send, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { fetchMenu, addItem, updateItem as updateItemAction, removeItem, optimisticToggleAvailability } from "@/lib/store/features/menuSlice";
import type { MenuItem, MenuCategory } from "@/lib/store/features/menuSlice";

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, categories, loading } = useAppSelector(s => s.menu);

  const descMap: Record<string, string> = {
    "item-1": "menu.kurtDesc",
    "item-2": "menu.kitfoDesc",
    "item-3": "menu.goredDesc",
    "item-4": "menu.zelzlDesc",
    "item-5": "menu.tibsDesc",
    "item-6": "menu.awazeDesc",
  };
  const itemDesc = (item: { id: string; description?: string }) =>
    descMap[item.id] ? t(descMap[item.id]) : (item.description || "");
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isClient = userRole === "CLIENT";
  const canAddItem = ["ADMIN", "WAITER", "KITCHEN"].includes(userRole);
  const canEditDelete = userRole === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearchQuery(q);
  }, []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  useEffect(() => { dispatch(fetchMenu()); }, [dispatch]);

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const prev = items.find(i => i.id === itemId);
    if (!prev) return;
    dispatch(removeItem(itemId));
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Menu item deleted");
      } else {
        dispatch(addItem(prev));
        toast.error(data.error || "Failed to delete item");
      }
    } catch {
      dispatch(addItem(prev));
      toast.error("Failed to delete item");
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice } : c);
      return [...prev, { id: item.id, name: item.name, unitPrice: item.price, quantity: 1, totalPrice: item.price, image: item.image }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === itemId ? { ...c, quantity: Math.max(0, c.quantity + delta), totalPrice: Math.max(0, c.quantity + delta) * c.unitPrice } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.totalPrice, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [items, searchQuery]
  );

  const grouped = useMemo(() => {
    const topLevel = categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const children = categories.filter(c => c.parentId);
    return topLevel.map(parent => {
      const parentItems = filtered.filter(i => i.categoryId === parent.id);
      const subs = children.filter(c => c.parentId === parent.id).sort((a, b) => a.sortOrder - b.sortOrder);
      const subWithItems = subs.filter(s => filtered.some(i => i.categoryId === s.id));
      if (parentItems.length === 0 && subWithItems.length === 0) return null;
      return {
        ...parent,
        subcategories: subWithItems,
        hasParentItems: parentItems.length > 0,
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [categories, filtered]);

  function ItemCard({ item, catIndex, itemIndex }: { item: MenuItem; catIndex: number; itemIndex: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: catIndex * 0.1 + itemIndex * 0.05 }}
      >
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 cursor-pointer relative overflow-hidden">
          {item.image ? (
            <div className="relative w-full h-52 overflow-hidden bg-muted">
              <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm lg:text-base text-white drop-shadow-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{itemDesc(item)}</p>
                    )}
                  </div>
                  {canEditDelete && (
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/90 hover:text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/90 hover:text-destructive hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <CardContent className="p-4 lg:p-5 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm lg:text-base text-foreground dark:text-ethiopian-cream">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground dark:text-ethiopian-cream/60 line-clamp-1 mt-0.5">{itemDesc(item)}</p>
                  )}
                </div>
                {canEditDelete && (
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
          <CardContent className="px-4 lg:px-5 py-3">
            {canAddItem && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const prev = { ...item };
                    dispatch(optimisticToggleAvailability(item.id));
                    try {
                      const res = await fetch(`/api/menu/items/${item.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isAvailable: !item.isAvailable }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        toast.success(item.isAvailable ? "Marked unavailable" : "Marked available");
                      }
                    } catch {
                      dispatch(updateItemAction(prev));
                    }
                  }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
                    item.isAvailable
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {item.isAvailable ? "Available" : "Unavailable"}
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                <span>{item.preparationTime} min</span>
              </div>
              <p className="font-bold text-base lg:text-lg text-primary dark:text-ethiopian-cream">{formatCurrency(item.price)}</p>
            </div>
            {item.isAvailable && !isClient && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                {cart.find(c => c.id === item.id) ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm font-medium">{cart.find(c => c.id === item.id)?.quantity || 0}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>
                    <Plus className="h-3 w-3 mr-1" /> {t("menu.addToCart")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
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
            <UtensilsCrossed className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{t("menu.title")}</h1>
            <p className="text-sm text-muted-foreground">{items.length} items · {categories.length} categories</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("menu.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
            />
          </div>
          {canAddItem && (
            <Button
              variant="premium"
              onClick={() => { setEditingItem(null); setDialogOpen(true); }}
              className="h-10 lg:h-11 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <UtensilsCrossed className="h-10 w-10" />
                </div>
                <p className="text-lg font-semibold mb-2">{t("common.noResults")}</p>
                <p className="text-sm mb-6">Add your first menu item to get started</p>
                {canAddItem && (
                  <Button
                    variant="premium"
                    onClick={() => { setEditingItem(null); setDialogOpen(true); }}
                    className="h-11"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {grouped.map((cat, catIndex) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{cat.name}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Parent's own items */}
              {cat.hasParentItems && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-8">
                  {filtered.filter(i => i.categoryId === cat.id).map((item, itemIndex) => (
                    <ItemCard key={item.id} item={item} catIndex={catIndex} itemIndex={itemIndex} />
                  ))}
                </div>
              )}

              {/* Subcategories */}
              {cat.subcategories.map((sub, subIndex) => (
                <div key={sub.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4 ml-4">
                    <div className="w-2 h-2 rounded-full bg-border" />
                    <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{sub.name}</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                    {filtered.filter(i => i.categoryId === sub.id).map((item, itemIndex) => (
                      <ItemCard key={item.id} item={item} catIndex={catIndex + subIndex * 0.1} itemIndex={itemIndex} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        editingItem={editingItem}
      />

      {cartCount > 0 && !isClient && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <Button
            className="h-14 w-14 rounded-full shadow-xl"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold">
              {cartCount}
            </span>
          </Button>
        </div>
      )}

      {showCart && !isClient && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">{t("cart.title")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 190px)" }}>
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("cart.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{t("cart.total")}</span>
                  <span className="font-bold text-xl">{formatCurrency(cartTotal)}</span>
                </div>
                <Button className="w-full h-12 text-base" onClick={() => { setOrderDialogOpen(true); }}>
                  <ArrowRight className="h-4 w-4 mr-2" /> {t("cart.checkout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {!isClient && (
        <PlaceOrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          cart={cart}
          cartTotal={cartTotal}
          onOrderPlaced={() => { setCart([]); setShowCart(false); setOrderDialogOpen(false); }}
        />
      )}
    </div>
  );
}

function AddItemDialog({ open, onOpenChange, categories, editingItem }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MenuCategory[];
  editingItem: MenuItem | null;
}) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [prepTime, setPrepTime] = useState("15");
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || "");
      setPrice(editingItem.price.toString());
      setCategoryId(editingItem.categoryId);
      setPrepTime(editingItem.preparationTime.toString());
      setImage(editingItem.image || "");
    } else {
      setName(""); setDescription(""); setPrice(""); setCategoryId(""); setPrepTime("15"); setImage("");
    }
  }, [editingItem, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) { toast.error("Name, price and category required"); return; }
    setSubmitting(true);
    try {
      const url = editingItem ? `/api/menu/items/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          price: parseFloat(price),
          categoryId,
          preparationTime: parseInt(prepTime) || 15,
          image: image || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? "Menu item updated" : "Menu item added");
        onOpenChange(false);
        if (editingItem) {
          dispatch(updateItemAction(data.data));
        } else {
          dispatch(addItem(data.data));
        }
      } else {
        toast.error(data.error || "Failed to save item");
      }
    } catch {
      toast.error("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen && !editingItem) {
        setTimeout(() => { setName(""); setDescription(""); setPrice(""); setCategoryId(""); setPrepTime("15"); setImage(""); }, 100);
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update the menu item details" : "Add a new item to your menu"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grilled Salmon" required className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-sm font-medium">Description</Label>
              <textarea
                id="desc" value={description} onChange={e => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                placeholder="Describe your dish..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-sm font-medium">{t("menu.price")} *</Label>
                <Input id="price" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prep" className="text-sm font-medium">Prep Time (min)</Label>
                <Input id="prep" type="number" min="1" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">{t("menu.category")} *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Photo</Label>
              <div className="flex items-center gap-3">
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="h-11 file:h-full file:border-0 file:bg-muted file:px-3 file:mr-3 file:text-sm file:font-medium hover:file:bg-muted/80" />
              </div>
              {image && (
                <div className="relative w-full h-28 overflow-hidden rounded-xl border bg-muted mt-1">
                  <img src={image} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background" onClick={() => setImage("")}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11">{t("common.cancel")}</Button>
            <Button type="submit" variant="premium" disabled={submitting} className="h-11">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PlaceOrderDialog({ open, onOpenChange, cart, cartTotal, onOrderPlaced }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  onOrderPlaced: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const [orderType, setOrderType] = useState("DINE_IN");
  const [guestCount, setGuestCount] = useState("1");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: orderType,
          guestCount: parseInt(guestCount) || 1,
          notes: notes || undefined,
          subtotal: cartTotal,
          total: cartTotal,
          items: cart.map(c => ({
            menuItemId: c.id,
            name: c.name,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            totalPrice: c.totalPrice,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${data.data.orderNumber} placed!`);
        onOrderPlaced();
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch {
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Place Order</DialogTitle>
          <DialogDescription>Confirm your order details</DialogDescription>
        </DialogHeader>
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
          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">{t("orders.items")} ({cart.reduce((s, c) => s + c.quantity, 0)})</p>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex items-center justify-between font-semibold">
            <span>{t("orders.total")}</span>
            <span className="text-lg">{formatCurrency(cartTotal)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Placing...</> : <><Send className="h-4 w-4 mr-1" /> Place Order</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
