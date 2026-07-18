"use client";

import { motion } from "framer-motion";
import { Beef } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function ButcherShopPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
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
          <p className="text-sm text-ethiopian-coffee/60">Items that require butcher preparation</p>
        </div>
      </div>

      <div className="text-center py-12">
        <Beef className="w-12 h-12 text-ethiopian-gold mx-auto mb-3 opacity-40" />
        <p className="text-ethiopian-coffee/60">No butcher items</p>
      </div>
    </div>
  );
}
