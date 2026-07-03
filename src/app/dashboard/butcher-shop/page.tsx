"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Minus, Plus, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

const meatTypes = ["Beef", "Lamb", "Goat", "Chicken"];
const weightPresets = [0.5, 1, 2, 3, 5];
const dishOptions = ["Tibs", "Kurt", "Dulet", "Tere Sega", "Gored Gored"];

export default function ButcherShopPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [meatType, setMeatType] = useState("Beef");
  const [menuItemName, setMenuItemName] = useState("Tibs");
  const [weight, setWeight] = useState("1");
  const [customWeight, setCustomWeight] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) { toast.error("Select a weight"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `order-${Date.now()}`,
          orderNumber: 0,
          tableNumber: tableNumber || null,
          menuItemName,
          quantity,
          orderTime: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Butcher order placed!`);
        setMenuItemName("Tibs");
        setWeight("1");
        setQuantity(1);
        setTableNumber("");
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
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="p-2.5 rounded-xl bg-gradient-to-br from-ethiopian-burgundy to-ethiopian-gold text-white shadow-lg"
        >
          <Beef className="w-6 h-6" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold font-serif text-ethiopian-coffee">Butcher Shop</h1>
          <p className="text-sm text-ethiopian-coffee/60">Order raw meat for your dishes</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-ethiopian-gold/10"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-3">Meat Type</label>
            <div className="flex flex-wrap gap-2">
              {meatTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setMeatType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    meatType === type
                      ? "bg-ethiopian-burgundy text-white shadow-md"
                      : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 border border-transparent"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-3">Dish</label>
            <div className="flex flex-wrap gap-2">
              {dishOptions.map((dish) => (
                <button
                  key={dish}
                  onClick={() => setMenuItemName(dish)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    menuItemName === dish
                      ? "bg-ethiopian-gold text-white shadow-md"
                      : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 border border-transparent"
                  }`}
                >
                  {dish}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-3">Weight (kg)</label>
            <div className="flex flex-wrap gap-2">
              {weightPresets.map((w) => (
                <button
                  key={w}
                  onClick={() => { setWeight(w.toString()); setCustomWeight(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    weight === w.toString() && !customWeight
                      ? "bg-ethiopian-burgundy text-white shadow-md"
                      : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 border border-transparent"
                  }`}
                >
                  {w} kg
                </button>
              ))}
              <button
                onClick={() => setCustomWeight(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  customWeight
                    ? "bg-ethiopian-gold text-white shadow-md"
                    : "bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 border border-transparent"
                }`}
              >
                Custom
              </button>
            </div>
            {customWeight && (
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold text-ethiopian-gold min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-ethiopian-cream text-ethiopian-coffee hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">Table Number (optional)</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-coffee mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-ethiopian-coffee border border-transparent focus:border-ethiopian-gold focus:outline-none"
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-10 py-3.5 rounded-xl bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? "Placing..." : "Place Order"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}