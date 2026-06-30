"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CookingPot, Inbox, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function KDSPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
            <CookingPot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
            <p className="text-sm text-muted-foreground">Real-time kitchen orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="h-32 w-32 rounded-full border-2 border-dashed border-primary/20" />
            </motion.div>
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Inbox className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xl font-semibold mb-2">No pending orders</p>
          <p className="text-muted-foreground mb-6">Orders from the POS will appear here in real time</p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Waiting for orders...</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Kitchen ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
