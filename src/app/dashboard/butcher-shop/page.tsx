"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Minus, Plus, X, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

const meatTypes = ["Beef", "Lamb", "Goat", "Chicken"];
const portionOptions = ["1/3 kg", "1/2 kg", "1 kg", "2 kg", "3 kg", "5 kg"];
const meatPrices: Record<string, Record<string, number>> = {
  Beef:    { "1/3 kg": 250, "1/2 kg": 350, "1 kg": 650, "2 kg": 1200, "3 kg": 1700, "5 kg": 2500 },
  Lamb:    { "1/3 kg": 280, "1/2 kg": 400, "1 kg": 750, "2 kg": 1400, "3 kg": 2000, "5 kg": 3000 },
  Goat:    { "1/3 kg": 300, "1/2 kg": 420, "1 kg": 800, "2 kg": 1500, "3 kg": 2200, "5 kg": 3500 },
  Chicken: { "1/3 kg": 180, "1/2 kg": 250, "1 kg": 450, "2 kg": 850,  "3 kg": 1200, "5 kg": 1800 },
};

type ButcherOrderItem = {
  meatType: string;
  portionSize: string;
  quantity: number;
  dish: string;
};

export default function ButcherShopPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const meatTypeLabels: Record<string, string> = {
    Beef: t("butcher.meatBeef"),
    Lamb: t("butcher.meatLamb"),
    Goat: t("butcher.meatGoat"),
    Chicken: t("butcher.meatChicken"),
  };
  const [items, setItems] = useState<ButcherOrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add initial item
  const addItem = () => {
    setItems([
      ...items,
      {
        meatType: "Beef",
        portionSize: "1/2 kg",
        quantity: 1,
        dish: "",
      },
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item
  const updateItem = (index: number, field: keyof ButcherOrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculate total for an item
  const getItemTotal = (item: ButcherOrderItem) => {
    const unitPrice = meatPrices[item.meatType]?.[item.portionSize] || 0;
    return unitPrice * item.quantity;
  };

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    for (const item of items) {
      if (!item.dish) {
        toast.error("Please specify the dish for each item");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Butcher order #${data.data.orderNumber} placed!`);
        setItems([]);
        setNotes("");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="p-2.5 rounded-xl bg-gradient-to-br from-ethiopian-burgundy to-ethiopian-gold text-white shadow-lg"
        >
          <Beef className="w-6 h-6" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">{t("nav.butcherShop")}</h1>
          <p className="text-sm text-ethiopian-coffee/60">{t("butcher.placeOrder")}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-ethiopian-gold/10"
      >
        {/* Items List */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={index} className="p-4 border border-ethiopian-gold/20 rounded-xl bg-ethiopian-cream/30">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-ethiopian-coffee">Item {index + 1}</h3>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dish Purpose */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">Dish (e.g., Kitfo, Tibs)</label>
                <input
                  type="text"
                  value={item.dish}
                  onChange={(e) => updateItem(index, "dish", e.target.value)}
                  placeholder="e.g., Kitfo"
                  className="w-full px-4 py-2 rounded-lg bg-white text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none"
                />
              </div>

              {/* Meat Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">{t("butcher.meatType")}</label>
                <div className="flex flex-wrap gap-2">
                  {meatTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateItem(index, "meatType", type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        item.meatType === type
                          ? "bg-ethiopian-burgundy text-white shadow-md"
                          : "bg-white text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                      }`}
                    >
                      {meatTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Size */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">{t("butcher.portionSize")}</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {portionOptions.map((size) => {
                    const price = meatPrices[item.meatType]?.[size] || 0;
                    return (
                      <button
                        key={size}
                        onClick={() => updateItem(index, "portionSize", size)}
                        className={`flex flex-col items-center px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          item.portionSize === size
                            ? "bg-ethiopian-gold text-white shadow-md"
                            : "bg-white text-ethiopian-coffee hover:bg-ethiopian-gold/20"
                        }`}
                      >
                        <span>{size}</span>
                        <span className={`text-xs mt-1 ${item.portionSize === size ? "text-white/80" : "text-ethiopian-gold"}`}>
                          ETB {price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">{t("butcher.quantity")}</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white text-ethiopian-coffee hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-ethiopian-gold min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(index, "quantity", Math.min(20, item.quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-white text-ethiopian-coffee hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-ethiopian-coffee/70 ml-4">
                    ETB {getItemTotal(item).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ethiopian-gold/20 text-ethiopian-burgundy hover:bg-ethiopian-gold/30 transition-all mb-6"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Item</span>
        </button>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-ethiopian-coffee mb-3">{t("butcher.notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., cut into small cubes, mince finely, remove bones..."
            className="w-full px-4 py-3 rounded-xl bg-ethiopian-cream text-ethiopian-coffee placeholder:text-ethiopian-coffee/40 text-sm border border-transparent focus:border-ethiopian-gold focus:outline-none transition-all resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {items.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-ethiopian-coffee to-ethiopian-charcoal text-white">
              <p className="text-xs opacity-80">Total</p>
              <p className="text-2xl font-bold">ETB {grandTotal.toLocaleString()}</p>
            </div>
          )}
          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? t("common.loading") : `${t("butcher.placeOrder")} - ETB ${grandTotal.toLocaleString()}`}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
