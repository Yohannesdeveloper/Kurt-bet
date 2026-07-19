"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Plus, Minus, ShoppingCart, X, Check,
  ArrowLeft, Send, Search, Loader2, Inbox
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function SelfOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SelfOrderContent />
    </Suspense>
  );
}

function SelfOrderContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const addToCart = (item: { id: string; name: string; price: number; image?: string }) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) return prev.map((ci) => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
    toast.success(t("selfOrder.itemAdded", { name: item.name }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === itemId);
      if (existing && existing.quantity > 1) return prev.map((ci) => ci.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci);
      return prev.filter((ci) => ci.id !== itemId);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (ordered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("selfOrder.orderPlaced")}</h1>
          <p className="text-muted-foreground mb-2">{t("selfOrder.sentToKitchen")}</p>
          {tableNumber && <p className="text-sm text-muted-foreground">{t("selfOrder.beingPrepared", { number: tableNumber })}</p>}
          <Button className="mt-6" onClick={() => setOrdered(false)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("selfOrder.orderMore")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <span className="font-bold">{t("selfOrder.digitalMenu")}</span>
            {tableNumber && <Badge variant="secondary">{t("selfOrder.table", { number: tableNumber })}</Badge>}
          </div>
          <Button variant="outline" size="sm" className="relative" onClick={() => setShowCart(!showCart)}>
            <ShoppingCart className="h-4 w-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16 text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-3" />
          <p className="font-medium">{t("selfOrder.menuNotAvailable")}</p>
          <p className="text-sm">{t("selfOrder.scanQR")}</p>
        </div>
      </div>

      {showCart && (
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="fixed inset-x-0 bottom-0 z-30 bg-background border-t rounded-t-3xl shadow-2xl" style={{ maxHeight: "70vh" }}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">{t("selfOrder.yourOrder")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(70vh - 140px)" }}>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t("selfOrder.cartEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-muted rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-4 border-t bg-background rounded-b-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{t("selfOrder.total")}</span>
                <span className="font-bold text-xl">{formatCurrency(total)}</span>
              </div>
              <Button className="w-full h-12 text-base" onClick={() => { setOrdered(true); setCart([]); }}>
                <Send className="h-4 w-4 mr-2" /> {t("selfOrder.placeOrder")}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
