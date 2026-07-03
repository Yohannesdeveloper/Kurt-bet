"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Plus, Inbox, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");

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
            <Users className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Customer profiles, loyalty, and history
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
            />
          </div>
          {isAdmin && (
            <Button variant="premium" className="h-10 lg:h-11 flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No customers yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Customer profiles will appear here once they are added.
            </p>
            {isAdmin && (
              <Button variant="premium" className="h-11">
                <Plus className="h-4 w-4 mr-2" /> Add Customer
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
