"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Beef, Minus, Plus } from "lucide-react";
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

export default function ButcherShopPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const meatTypeLabels: Record<string, string> = {
    Beef: t("butcher.beef"),
    Lamb: t("butcher.lamb"),
    Goat: t("butcher.goat"),
    Chicken: t("butcher.chicken"),
  };
  const [meatType, setMeatType] = useState("Beef");
  const [portionSize, setPortionSize] = useState("1/2 kg");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = meatPrices[meatType]?.[portionSize] || 0;
  const total = unitPrice * quantity;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meatType, portionSize, quantity, notes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Butcher order #${data.data.orderNumber} placed!`);
        setMeatType("Beef");
        setPortionSize("1/2 kg");
        setQuantity(1);
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
          className="p-2.5 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] text-white shadow-lg"
        >
          <Beef className="w-6 h-6" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">{t("nav.butcherShop")}</h1>
          <p className="text-sm text-[#3E2723]/60">{t("butcher.placeOrder")}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-[#C89B3C]/10"
      >
        {/* Meat Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3E2723] mb-3">{t("butcher.meatType")}</label>
          <div className="flex flex-wrap gap-2">
            {meatTypes.map((type) => (
              <button
                key={type}
                onClick={() => { setMeatType(type); setPortionSize("1/2 kg"); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  meatType === type
                    ? "bg-[#A12222] text-white shadow-md scale-105"
                    : "bg-[#F8F4EE] text-[#3E2723] hover:bg-[#C89B3C]/20"
                }`}
              >
                {meatTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Portion Size */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3E2723] mb-3">{t("butcher.portionSize")}</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {portionOptions.map((size) => {
              const price = meatPrices[meatType]?.[size] || 0;
              return (
                <button
                  key={size}
                  onClick={() => setPortionSize(size)}
                  className={`flex flex-col items-center px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    portionSize === size
                      ? "bg-[#C89B3C] text-white shadow-md scale-105 border-2 border-[#C89B3C]"
                      : "bg-[#F8F4EE] text-[#3E2723] hover:bg-[#C89B3C]/20 border-2 border-transparent"
                  }`}
                >
                  <span>{size}</span>
                  <span className={`text-xs mt-1 ${portionSize === size ? "text-white/80" : "text-[#C89B3C]"}`}>
                    ETB {price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity + Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-3">{t("butcher.quantity")}</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-[#F8F4EE] text-[#3E2723] hover:bg-[#C89B3C]/20 transition-all flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-bold text-[#C89B3C] min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="w-12 h-12 rounded-xl bg-[#F8F4EE] text-[#3E2723] hover:bg-[#C89B3C]/20 transition-all flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-3">{t("orders.total")}</label>
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#3E2723] to-[#1B1B1B] text-white">
              <p className="text-xs opacity-80">{quantity} x {portionSize} {meatTypeLabels[meatType]}</p>
              <p className="text-2xl font-bold">ETB {total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3E2723] mb-3">{t("butcher.notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., cut into small cubes, mince finely, remove bones..."
            className="w-full px-4 py-3 rounded-xl bg-[#F8F4EE] text-[#3E2723] placeholder:text-[#3E2723]/40 text-sm border border-transparent focus:border-[#C89B3C] focus:outline-none transition-all resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#A12222] to-[#C89B3C] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {submitting ? t("common.loading") : `${t("butcher.placeOrder")} - ETB ${total.toLocaleString()}`}
        </motion.button>
      </motion.div>
    </div>
  );
}
