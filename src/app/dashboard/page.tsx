"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, Bell, ShoppingCart, User, MapPin, Star, Clock,
  ChevronRight, Home, UtensilsCrossed, Receipt,
  Heart, Percent, Menu, X, ChevronLeft,
  ChevronRight as ChevronRightIcon, Sparkles, Flame,
  Zap, TrendingUp, Store, CookingPot, ClipboardList, Users, LogOut,
  Beef, Drumstick, Check, XCircle, Send, Minus, Plus, Gem, Award, Package,
  Coffee, Loader2, Sun, Moon
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { EthiopianCornerSet, JebenaIcon, MesobIcon, InjeraIcon } from "@/components/shared/ethiopian-patterns";
import { GoldButton } from "@/components/shared/section-header";
import { BartenderWorkflow } from "@/components/bartender/bartender-workflow";
import { useSocket } from "@/hooks/useSocket";
import { useSSENotifications } from "@/hooks/useSSENotifications";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationPopups } from "@/components/shared/NotificationPopups";

const categoryKeys = ["tereSega", "kitfo", "tibs", "goredGored", "awazeTibs", "zilzilTibs"] as const;
const categoryMeta: Record<string, { count: number; image: string; color: string; bg: string }> = {
  tereSega: { count: 28, image: "/images/kurt.jpg", color: "from-ethiopian-burgundy to-ethiopian-charcoal", bg: "bg-red-50" },
  kitfo: { count: 24, image: "/images/kifo.jpg", color: "from-ethiopian-gold to-ethiopian-earth", bg: "bg-amber-50" },
  tibs: { count: 32, image: "/images/tibs.jpg", color: "from-ethiopian-earth to-ethiopian-charcoal", bg: "bg-orange-50" },
  goredGored: { count: 19, image: "/images/gored gored.jpg", color: "from-ethiopian-charcoal to-ethiopian-coffee", bg: "bg-stone-50" },
  awazeTibs: { count: 15, image: "/images/Awaze Tibs.jpg", color: "from-ethiopian-burgundy to-ethiopian-coffee", bg: "bg-red-50" },
  zilzilTibs: { count: 22, image: "/images/zilzil tibs.jpg", color: "from-ethiopian-gold to-ethiopian-burgundy", bg: "bg-amber-50" },
};

const restaurantKeys = ["kurtBetSpecial", "addisKitfoHouse", "tibsPalace", "goredGoredHouse"] as const;
const restaurantMeta: Record<string, { rating: number; deliveryTime: string; price: string; image: string; color: string; tagKeys: string[]; featured: boolean; discount: string | null }> = {
  kurtBetSpecial: { rating: 4.9, deliveryTime: "30-45", price: "500", image: "/images/kurt.jpg", color: "from-ethiopian-burgundy to-ethiopian-charcoal", tagKeys: ["tereSega", "traditional"], featured: true, discount: "20" },
  addisKitfoHouse: { rating: 4.8, deliveryTime: "25-40", price: "450", image: "/images/kifo.jpg", color: "from-ethiopian-gold to-ethiopian-coffee", tagKeys: ["kitfo", "authentic"], featured: true, discount: "15" },
  tibsPalace: { rating: 4.7, deliveryTime: "35-50", price: "380", image: "/images/tibs.jpg", color: "from-ethiopian-earth to-ethiopian-charcoal", tagKeys: ["tibs", "spicy"], featured: false, discount: null },
  goredGoredHouse: { rating: 4.6, deliveryTime: "20-35", price: "420", image: "/images/gored gored.jpg", color: "from-ethiopian-coffee to-ethiopian-charcoal", tagKeys: ["goredGored", "fresh"], featured: false, discount: null },
};

function Header({ onNotifClick }: { onNotifClick: () => void }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { notifications, unreadCount } = useNotificationStore();
  const readyCount = notifications.filter(n => n.type === "ORDER_READY" && !n.isRead).length;
  const displayCount = readyCount || unreadCount;
  const role = (session?.user as { role?: string })?.role;
  const canNotify = role === "WAITER" || role === "ADMIN";

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchRef.current?.value.trim()) {
      window.location.href = `/menu?search=${encodeURIComponent(searchRef.current.value.trim())}`;
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-card/98 dark:bg-ethiopian-coffee/98 backdrop-blur-2xl border-b border-border dark:border-ethiopian-gold/10 shadow-2xl shadow-black/30"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-20 2xl:h-24">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-ethiopian-gold/20">
                <img src="/images/Logo.jpg" alt="Habesha Kurt Bet Logo" className="h-full w-full object-cover" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-40 blur-md"
              />
            </div>
            <span className="font-bold text-xl font-serif text-ethiopian-gold">
              {t("brand.name")}
            </span>
          </motion.div>

          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-4 lg:mx-8">
            <motion.div animate={{ scale: searchFocused ? 1.02 : 1 }} className="relative w-full">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? "text-ethiopian-gold" : "text-ethiopian-gold/40"}`} />
              <input
                ref={searchRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-muted/50 dark:bg-white/5 backdrop-blur-sm border border-primary/20 dark:border-ethiopian-gold/20 text-foreground dark:text-ethiopian-cream placeholder:text-muted-foreground dark:placeholder:text-ethiopian-cream/30 focus:border-ethiopian-gold/50 focus:bg-muted/80 dark:focus:bg-white/10 focus:shadow-lg focus:shadow-ethiopian-gold/10 outline-none transition-all duration-300 text-sm"
              />
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-ethiopian-gold/10 border border-primary/20 dark:border-ethiopian-gold/20 text-muted-foreground dark:text-ethiopian-cream/70 hover:text-primary dark:hover:text-ethiopian-gold cursor-pointer transition-colors">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{t("header.location")}</span>
          </motion.div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-ethiopian-gold/10 transition-colors group"
              >
                {theme === "light" ? (
                  <Sun className="w-5 h-5 text-muted-foreground dark:text-ethiopian-cream/70 group-hover:text-ethiopian-gold transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground dark:text-ethiopian-cream/70 group-hover:text-ethiopian-gold transition-colors" />
                )}
              </button>
            )}
            {canNotify && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotifClick}
                className="relative p-2 rounded-full hover:bg-ethiopian-gold/10 transition-colors group"
              >
                <Bell className="w-5 h-5 text-muted-foreground dark:text-ethiopian-cream/70 group-hover:text-ethiopian-gold transition-colors" />
                {displayCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ethiopian-clay text-[9px] font-bold text-white"
                  >
                    {displayCount}
                  </motion.span>
                )}
              </motion.button>
            )}
            <motion.div whileHover={{ scale: 1.02 }} className="hidden sm:flex items-center gap-3 pl-3 border-l border-ethiopian-gold/20 cursor-pointer">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-ethiopian-gold/20">
                  {(session?.user?.email || "J").charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-ethiopian-coffee" />
              </div>
              <span className="text-sm font-medium text-muted-foreground dark:text-ethiopian-cream/70 hidden lg:block">
                {session?.user?.email || "user@email.com"}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ethiopian-gold/40" />
            <input type="text" placeholder={t("header.mobileSearchPlaceholder")} className="w-full pl-12 pr-4 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-ethiopian-gold/20 text-ethiopian-cream placeholder:text-ethiopian-cream/30 focus:border-ethiopian-gold/50 outline-none transition-colors text-sm" />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

function Sidebar({ isOpen, onClose, currentView, onNavigate }: { isOpen: boolean; onClose: () => void; currentView: string; onNavigate: (view: string) => void }) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isClient = userRole === "CLIENT";
  const isWaiter = userRole === "WAITER";
  const isBartender = userRole === "BARTENDER";

  const allNavItems = [
    { icon: Home, label: t("nav.dashboard"), href: "/dashboard", key: "dashboard" },
    { icon: UtensilsCrossed, label: t("nav.menu"), href: "/menu", key: "menu" },
    { icon: Store, label: t("nav.tables"), href: "/tables", key: "tables" },
    { icon: Receipt, label: t("nav.orders"), href: "/orders", key: "orders" },
    { icon: CookingPot, label: t("nav.kitchen"), href: "/kds", key: "kitchen" },
    { icon: ClipboardList, label: t("nav.inventory"), href: "/inventory", key: "inventory" },
    { icon: Users, label: t("nav.employees"), href: "/employees", key: "employees" },
    { icon: Percent, label: t("nav.reports"), href: "/reports", key: "reports" },
    { icon: Beef, label: t("nav.butcherShop"), href: "/dashboard/butcher-shop", key: "butcher-shop" },
    { icon: Coffee, label: t("nav.bartender"), href: "/dashboard/bartender", key: "bartender" },
  ];

  const allowedForBartender = new Set(["menu", "orders", "bartender"]);
  const hiddenForClient = new Set(["inventory", "employees", "reports"]);
  const hiddenForWaiter = new Set(["inventory", "employees", "reports"]);
  const navItems = allNavItems.filter((item) => {
    if (isBartender && !allowedForBartender.has(item.key)) return false;
    if (isClient && hiddenForClient.has(item.key)) return false;
    if (isWaiter && hiddenForWaiter.has(item.key)) return false;
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-ethiopian-charcoal/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 h-full w-72 lg:w-64 xl:w-72 2xl:w-80 bg-card dark:bg-gradient-to-b dark:from-ethiopian-coffee dark:via-ethiopian-charcoal dark:to-black shadow-2xl shadow-black/50 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:shadow-lg lg:translate-x-0 lg:block`}>
        <div className="p-6 h-full flex flex-col">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 mb-8 cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-ethiopian-gold/20">
                <img src="/images/Logo.jpg" alt="Habesha Kurt Bet Logo" className="h-full w-full object-cover" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-1 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-40 blur-md" />
            </div>
            <span className="font-bold text-xl font-serif text-ethiopian-gold">
              {t("brand.name")}
            </span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ethiopian-gold via-ethiopian-gold to-ethiopian-clay p-6 mb-8 text-white shadow-lg shadow-ethiopian-gold/20">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" />
                <p className="text-xs font-semibold tracking-wider uppercase">{t("sidebar.limitedTime")}</p>
              </div>
              <p className="text-2xl font-bold mb-1 font-serif">{t("sidebar.get50Off")}</p>
              <p className="text-sm opacity-90 mb-3">{t("sidebar.onFirstOrder")}</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold cursor-pointer border border-white/30">
                {t("sidebar.codeFood50")}
              </motion.div>
            </div>
          </motion.div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.href === "/dashboard") {
                    onNavigate("home");
                  } else if (item.key === "butcher-shop") {
                    onNavigate("butcher-shop");
                  } else if (item.key === "bartender") {
                    onNavigate("bartender");
                  } else if (item.href.startsWith("/dashboard")) {
                    window.location.href = item.href;
                  } else {
                    window.location.href = item.href;
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent ${
                  currentView === (item.key === "butcher-shop" ? "butcher-shop" : item.key === "bartender" ? "bartender" : item.href === "/dashboard" ? "home" : undefined)
                    ? "bg-ethiopian-gold/15 text-ethiopian-gold border-ethiopian-gold/30 shadow-sm shadow-ethiopian-gold/10"
                    : "text-muted-foreground dark:text-ethiopian-cream/50 hover:bg-ethiopian-gold/10 hover:text-ethiopian-gold hover:border-ethiopian-gold/20"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-ethiopian-gold/10">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 p-3 rounded-xl bg-ethiopian-clay/10 border border-ethiopian-clay/20 hover:bg-ethiopian-clay/20 transition-all duration-200 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ethiopian-clay to-ethiopian-burgundy flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ethiopian-clay dark:text-white">{t("sidebar.logout")}</p>
                <p className="text-xs text-ethiopian-clay/70 dark:text-white/70">{t("sidebar.endSession")}</p>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function HeroBanner() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-burgundy p-6 sm:p-8 lg:p-12 xl:p-16 text-white shadow-2xl dark:shadow-2xl">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 w-96 h-96 bg-ethiopian-gold/20 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-20 -left-20 w-96 h-96 bg-ethiopian-clay/20 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, -30, 0], x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/4 w-32 h-32 bg-ethiopian-gold/15 rounded-full blur-2xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.04] bg-ethiopian-cross pointer-events-none" />

      {[...Array(6)].map((_, i) => (
        <motion.div key={i} animate={{ y: [0, -100, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }} transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }} className="absolute w-2 h-2 bg-ethiopian-gold rounded-full blur-sm" style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` } as CSSProperties} />
      ))}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-ethiopian-gold/20 to-ethiopian-clay/20 border border-ethiopian-gold/40 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-ethiopian-gold" />
              <span className="text-xs font-bold tracking-wider uppercase text-ethiopian-gold">{t("hero.hotDeal")}</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold mb-4 leading-tight">
              {t("hero.title")}
              <br />
              <span className="bg-gradient-to-r from-ethiopian-gold via-yellow-300 to-ethiopian-gold bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base lg:text-lg xl:text-xl mb-6 lg:mb-8 max-w-md lg:max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <GoldButton href="/menu">
              {t("hero.orderNow")}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </GoldButton>
          </motion.div>
        </div>

        <div className="hidden lg:flex justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.2, type: "spring" }} whileHover={{ scale: 1.05, rotate: 5 }} className="relative">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-3xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-full h-full">
                <img src="/images/kurt.jpg" alt="Ethiopian Tere Sega" className="w-full h-full object-cover" />
              </motion.div>
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white text-sm font-bold shadow-lg border-2 border-white/30">
              {t("hero.badge")}
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute -bottom-4 -left-4 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
              {t("hero.freeDelivery")}
            </motion.div>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} animate={{ scale: [0, 1, 0], rotate: [0, 180] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} className="absolute w-3 h-3" style={{ top: `${20 + i * 20}%`, right: `${10 + i * 15}%` } as CSSProperties}>
                <Sparkles className="w-full h-full text-ethiopian-gold" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { t } = useTranslation();
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-serif font-bold text-foreground dark:bg-gradient-to-r dark:from-ethiopian-clay dark:to-ethiopian-gold dark:bg-clip-text dark:text-transparent">
          {t("dashboard.categories")}
        </motion.h2>
        <Link href="/menu">
          <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-ethiopian-gold font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all group">
            {t("common.viewAll")} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
        {categoryKeys.map((key, index) => {
          const cat = categoryMeta[key];
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} whileHover={{ y: -8 }} className="group cursor-pointer">
              <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${cat.color} p-4 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 overflow-hidden`}>
                <div className="absolute inset-0 opacity-[0.08] bg-ethiopian-cross pointer-events-none" />
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }} className="w-full h-full flex items-center justify-center">
                  <img src={cat.image} alt={t(`categories.${key}`)} className="w-full h-full object-cover rounded-xl" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl transition-opacity" />
                <motion.div initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold">
                  {t("categories.explore")}
                </motion.div>
              </div>
              <motion.p whileHover={{ scale: 1.05 }} className="text-center font-semibold text-foreground dark:text-ethiopian-clay text-sm group-hover:text-ethiopian-gold transition-colors">
                {t(`categories.${key}`)}
              </motion.p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function RestaurantCard({ restKey, index }: { restKey: string; index: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const restaurant = restaurantMeta[restKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onClick={() => router.push("/menu")}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card dark:bg-gradient-to-br dark:from-ethiopian-sand dark:to-ethiopian-cream mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 opacity-[0.06] bg-ethiopian-cross pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }} className={`absolute inset-0 bg-gradient-to-br ${restaurant.color} flex items-center justify-center`}>
          <img src={restaurant.image} alt={t(`restaurant.${restKey}`)} className="w-full h-full object-cover" />
        </motion.div>

        {restaurant.discount && (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white text-xs font-bold shadow-lg border-2 border-white/30">
            {restaurant.discount}
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-ethiopian-clay shadow-md border border-ethiopian-gold/20">
          {restaurant.price}
        </motion.div>

        {restaurant.featured && (
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3 text-ethiopian-gold" />
            <span className="text-xs font-semibold text-ethiopian-clay">{t("restaurant.featured")}</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity" />

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          onClick={() => router.push("/menu")}
          className="absolute bottom-3 left-3 right-3 px-4 py-2 rounded-full bg-white text-ethiopian-clay font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {t("restaurant.orderNow")}
        </motion.button>
      </div>

      <div className="space-y-2">
        <motion.h3 whileHover={{ scale: 1.02 }} className="font-bold font-serif text-foreground dark:text-ethiopian-clay text-lg group-hover:text-ethiopian-gold transition-colors">
          {t(`restaurant.${restKey}`)}
        </motion.h3>
        <div className="flex items-center gap-4 text-sm">
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-ethiopian-gold text-ethiopian-gold" />
            <span className="font-semibold text-foreground dark:text-ethiopian-clay">{restaurant.rating}</span>
          </motion.div>
          <div className="flex items-center gap-1 text-muted-foreground dark:text-ethiopian-clay/60">
            <Clock className="w-4 h-4" />
            <span>{t("restaurant.deliveryTime", { time: restaurant.deliveryTime })}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {restaurant.tagKeys.map((tagKey) => (
            <motion.span key={tagKey} whileHover={{ scale: 1.05 }} className="px-2 py-1 rounded-full bg-gradient-to-r from-ethiopian-cream to-ethiopian-cream/50 text-xs text-ethiopian-clay/70 border border-ethiopian-gold/20">
              {t(`restaurant.${tagKey}`)}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PopularRestaurants() {
  const { t } = useTranslation();
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground dark:text-ethiopian-clay">{t("dashboard.popularRestaurants")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {restaurantKeys.map((key, index) => (
          <RestaurantCard key={key} restKey={key} index={index} />
        ))}
      </div>
    </section>
  );
}

type ButcherOrder = {
  id: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  customerId: string;
  meatType: string;
  menuItemName: string;
  weight: number;
  quantity: number;
  tableNumber: string | null;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
};

function ButcherOrderForm() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const isButcher = role === "BUTCHER";
  const [activeTab, setActiveTab] = useState<"pending" | "status">("pending");
  const [meatType, setMeatType] = useState("Beef");
  const [menuItemName, setMenuItemName] = useState("Tibs");
  const [weight, setWeight] = useState("1");
  const [customWeight, setCustomWeight] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const meatTypes = [
    { id: "Beef", icon: Beef, color: "from-ethiopian-burgundy to-red-700", bg: "bg-red-50", label: "Beef" },
    { id: "Lamb", icon: Beef, color: "from-ethiopian-earth to-amber-700", bg: "bg-amber-50", label: "Lamb" },
    { id: "Goat", icon: Beef, color: "from-ethiopian-coffee to-stone-700", bg: "bg-stone-50", label: "Goat" },
    { id: "Chicken", icon: Drumstick, color: "from-ethiopian-gold to-yellow-600", bg: "bg-yellow-50", label: "Chicken" },
  ];
  const weightPresets = [0.5, 1, 2, 3, 5];
  const dishOptions = [
    { name: "Tibs", image: "/images/tibs.jpg", description: "Sautéed meat with onions, peppers & spices" },
    { name: "Kurt", image: "/images/kurt.jpg", description: "Ethiopian-style steak tartare" },
    { name: "Kitfo", image: "/images/kifo.jpg", description: "Minced raw beef mitmita & niter kibbeh" },
    { name: "Dulet", image: "/images/Yefseg/kurs/ዱለት (Dulet).jpg", description: "Minced tripe, liver & lean beef" },
    { name: "Gored Gored", image: "/images/gored gored.jpg", description: "Cubed raw beef with awaze & spices" },
  ];

  const [butcherOrders, setButcherOrders] = useState<ButcherOrder[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchButcherOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/butcher-orders");
      const data = await res.json();
      if (data.success) setButcherOrders(data.data);
    } catch {} finally { setStatusLoading(false); }
  }, []);

  useEffect(() => {
    if (isButcher) {
      fetchButcherOrders();
      const interval = setInterval(fetchButcherOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [isButcher, fetchButcherOrders]);

  const approveOrder = async (order: ButcherOrder) => {
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${order.orderNumber} approved and sent to kitchen`);
        fetchButcherOrders();
      } else toast.error(data.error || "Action failed");
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(null); }
  };

  const rejectOrder = async (order: ButcherOrder) => {
    setActionLoading(order.id);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "REJECTED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${order.orderNumber} rejected`);
        fetchButcherOrders();
      } else toast.error(data.error || "Action failed");
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(null); }
  };

  const pendingButcherOrders = butcherOrders.filter((o) => o.status === "PENDING");
  const processedButcherOrders = butcherOrders.filter((o) => o.status !== "PENDING");

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) { toast.error("Select a weight"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/butcher-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meatType,
          menuItemName,
          weight: w,
          quantity,
          tableNumber: tableNumber || null,
          notes: notes || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Butcher order #${data.data.orderNumber} placed!`);
        fetchButcherOrders();
        setMeatType("Beef");
        setMenuItemName("Tibs");
        setWeight("1");
        setQuantity(1);
        setTableNumber("");
        setNotes("");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch { toast.error("Failed to place order"); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="py-4">
      <div className="flex items-center gap-3 mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-2.5 rounded-xl bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold text-white shadow-lg">
          <Beef className="w-6 h-6" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-red-600 dark:text-red-500">Butcher Shop</h2>
          <p className="text-xs text-red-600/60 dark:text-red-500/60">Order raw meat for your dishes</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-ethiopian-gold/10">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-3">Meat Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {meatTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setMeatType(type.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      meatType === type.id
                        ? "border-ethiopian-gold ring-2 ring-ethiopian-gold/30 shadow-lg"
                        : "border-ethiopian-gold/10 hover:border-ethiopian-gold/40 hover:shadow-md"
                    }`}
                  >
                    <div className={`aspect-[4/3] flex flex-col items-center justify-center gap-1.5 ${type.bg} p-3`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-red-600 dark:text-red-500">{type.label}</span>
                    </div>
                    {meatType === type.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-ethiopian-gold rounded-full flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-3">Dish</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {dishOptions.map((dish, i) => (
                <motion.button
                  key={dish.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMenuItemName(dish.name)}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    menuItemName === dish.name
                      ? "border-ethiopian-gold ring-2 ring-ethiopian-gold/30 shadow-lg"
                      : "border-ethiopian-gold/10 hover:border-ethiopian-gold/40 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                      <p className="text-white font-bold text-sm drop-shadow-sm">{dish.name}</p>
                      <p className="text-white/70 text-[10px] leading-tight line-clamp-1">{dish.description}</p>
                    </div>
                  </div>
                  {menuItemName === dish.name && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-ethiopian-gold rounded-full flex items-center justify-center shadow">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-3">Weight (kg)</label>
            <div className="flex flex-wrap gap-2">
              {weightPresets.map((w) => (
                <button key={w} onClick={() => { setWeight(w.toString()); setCustomWeight(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    weight === w.toString() && !customWeight
                      ? "bg-ethiopian-burgundy text-white shadow-md"
                      : "bg-ethiopian-cream text-red-600 dark:text-red-500 hover:bg-ethiopian-gold/20 border border-transparent"
                  }`}
                >{w} kg</button>
              ))}
              <button onClick={() => setCustomWeight(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  customWeight
                    ? "bg-ethiopian-gold text-white shadow-md"
                    : "bg-ethiopian-cream text-red-600 dark:text-red-500 hover:bg-ethiopian-gold/20 border border-transparent"
                }`}
              >Custom</button>
            </div>
            {customWeight && (
              <input type="number" step="0.1" min="0.1" placeholder="Enter weight in kg"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-red-600 dark:text-red-500 border border-transparent focus:border-ethiopian-gold focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl bg-ethiopian-cream text-red-600 dark:text-red-500 hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center">
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-bold text-red-600 dark:text-red-500 min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-12 h-12 rounded-xl bg-ethiopian-cream text-red-600 dark:text-red-500 hover:bg-ethiopian-gold/20 transition-all flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-2">Table Number (optional)</label>
            <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-red-600 dark:text-red-500 border border-transparent focus:border-ethiopian-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 dark:text-red-500 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..." rows={2}
              className="w-full px-4 py-2 rounded-lg bg-ethiopian-cream text-red-600 dark:text-red-500 border border-transparent focus:border-ethiopian-gold focus:outline-none"
            />
          </div>

          <GoldButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Placing..." : "Place Order"}
          </GoldButton>
        </div>
      </motion.div>

      {isButcher && (
        <section className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-ethiopian-gold" />
            <h3 className="text-xl font-serif font-bold text-red-600 dark:text-red-500">Butcher Status</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500">
              {pendingButcherOrders.length} pending
            </span>
          </div>

          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "pending"
                  ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Orders
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20">{pendingButcherOrders.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "status"
                  ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Butcher Status
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20">{processedButcherOrders.length}</span>
            </button>
          </div>

          {statusLoading ? (
            <div className="text-center py-8 text-red-600/60 dark:text-red-500/60">Loading...</div>
          ) : (activeTab === "pending" ? pendingButcherOrders : processedButcherOrders).length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-ethiopian-gold mx-auto mb-2" />
              <p className="text-red-600/60 dark:text-red-500/60 text-sm">
                {activeTab === "pending" ? "No orders waiting for approval" : "No processed orders"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(activeTab === "pending" ? pendingButcherOrders : processedButcherOrders).map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md border border-ethiopian-gold/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 dark:text-red-500">#{order.orderNumber}</span>
                      {order.tableNumber && (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-500">Table {order.tableNumber}</span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      order.status === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-300" :
                      order.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      "bg-red-100 text-red-800 border-red-300"
                    }`}>
                      {order.status === "PENDING" ? "Pending" : order.status === "APPROVED" ? "Approved" : "Rejected"}
                    </span>
                  </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 border border-ethiopian-gold/10 rounded-lg bg-ethiopian-cream/20 mb-2 text-xs">
                    <div><span className="text-red-600/40 dark:text-red-500/40">Meat:</span> <span className="font-bold text-red-600 dark:text-red-500">{order.meatType}</span></div>
                    <div><span className="text-red-600/40 dark:text-red-500/40">Dish:</span> <span className="font-semibold text-red-600 dark:text-red-500">{order.menuItemName}</span></div>
                    <div><span className="text-red-600/40 dark:text-red-500/40">Weight:</span> <span className="font-bold text-red-600 dark:text-red-500">{order.weight} kg</span></div>
                    <div><span className="text-red-600/40 dark:text-red-500/40">Qty:</span> <span className="font-semibold text-red-600 dark:text-red-500">x{order.quantity}</span></div>
                  </div>

                  {order.notes && (
                    <div className="text-xs text-red-600/70 dark:text-red-500/70 italic border-l-2 border-ethiopian-gold/30 pl-2 mb-2">
                      "{order.notes}"
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-red-600/60 dark:text-red-500/60">
                      {new Date(order.createdAt).toLocaleString()} &middot; {order.customerName}
                    </div>

                    {activeTab === "pending" && order.status === "PENDING" && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => approveOrder(order)} disabled={actionLoading === order.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-ethiopian-burgundy to-ethiopian-gold text-white text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.id ? "..." : <><Check className="w-3.5 h-3.5" /> Approve</>}
                        </button>
                        <button onClick={() => rejectOrder(order)} disabled={actionLoading === order.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    {order.status === "APPROVED" && order.approvedAt && (
                      <div className="text-xs text-emerald-600 font-medium">
                        Approved: {new Date(order.approvedAt).toLocaleString()}
                      </div>
                    )}
                    {order.status === "REJECTED" && order.rejectedAt && (
                      <div className="text-xs text-red-600 font-medium">
                        Rejected: {new Date(order.rejectedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

function MobileNav() {
  const { t } = useTranslation();
  const mobileNavItems = [
    { icon: Home, label: t("nav.home"), href: "/dashboard" },
    { icon: Receipt, label: t("nav.orders"), href: "/orders" },
    { icon: Heart, label: t("nav.favorites"), href: "/menu" },
    { icon: User, label: t("nav.profile"), href: "/settings" },
  ];
  return (
    <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-ethiopian-cream/95 backdrop-blur-xl border-t border-border dark:border-ethiopian-gold/10 lg:hidden z-50 shadow-2xl">
      <div className="flex items-center justify-around py-2 sm:py-3">
        {mobileNavItems.map((item, index) => (
          <motion.a key={item.label} href={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 text-muted-foreground dark:text-ethiopian-clay/60 hover:text-ethiopian-gold transition-colors group relative"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-medium group-hover:font-semibold transition-all">{item.label}</span>
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}

function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "ADMIN";
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  const readyNotifs = notifications.filter(n => n.type === "ORDER_READY");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleNotifClick = async (n: any) => {
    markAsRead(n.id);
    const orderId = n.data?.orderId;
    if (!orderId) {
      if (n.actionUrl) window.location.href = n.actionUrl;
      return;
    }
    setLoadingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const d = await res.json();
      if (d.success) setSelectedOrder(d.data);
      else if (n.actionUrl) window.location.href = n.actionUrl;
    } catch {
      if (n.actionUrl) window.location.href = n.actionUrl;
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-ethiopian-charcoal/50 backdrop-blur-sm z-50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-ethiopian-cream shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-ethiopian-gold/10">
            <h2 className="text-lg font-bold font-serif text-ethiopian-clay">Notifications</h2>
            <div className="flex items-center gap-2">
              {readyNotifs.length > 0 && (
                <>
                  <button onClick={markAllAsRead} className="text-xs text-ethiopian-gold hover:underline">
                    Mark all read
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm("Clear all notification history?")) clearNotifications();
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear history
                    </button>
                  )}
                </>
              )}
              <button onClick={onClose} className="p-1 rounded-full hover:bg-ethiopian-cream transition-colors">
                <X className="w-5 h-5 text-ethiopian-clay" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {readyNotifs.length === 0 ? (
              <p className="text-center text-ethiopian-clay/50 py-8 text-sm">No notifications</p>
            ) : (
              readyNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    n.isRead
                      ? "bg-white/50 border-ethiopian-gold/5 text-ethiopian-clay/60"
                      : "bg-white border-ethiopian-gold/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-gray-300" : "bg-ethiopian-clay"}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${n.isRead ? "" : "text-ethiopian-clay"}`}>{n.title}</p>
                      <p className="text-xs text-ethiopian-clay/60 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(o) => { if (!o) setSelectedOrder(null); }}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          {loadingOrder ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-ethiopian-gold" />
            </div>
          ) : selectedOrder ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold flex items-center justify-center shadow-md">
                    <UtensilsCrossed className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Order #{selectedOrder.orderNumber}</DialogTitle>
                    <DialogDescription>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={selectedOrder.status === "READY" ? "bg-green-100 text-green-700" : ""}>
                    {selectedOrder.status}
                  </Badge>
                  {selectedOrder.table && (
                    <span className="text-xs text-ethiopian-clay/60">
                      Table {selectedOrder.table.number || selectedOrder.table.name}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ethiopian-clay">Items ({selectedOrder.items?.length || 0})</p>
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-ethiopian-gold/10">
                      {item.menuItem?.image ? (
                        <img src={item.menuItem.image} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-5 w-5 text-ethiopian-gold" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ethiopian-clay">{item.name}</p>
                        <p className="text-xs text-ethiopian-clay/50">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-ethiopian-gold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-ethiopian-coffee to-ethiopian-charcoal text-white">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canNotify = role === "WAITER" || role === "ADMIN";

  useSocket();
  useSSENotifications();

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-ethiopian-charcoal dark:via-black dark:to-ethiopian-coffee">
      <NotificationPopups />
      <Header onNotifClick={() => setNotifOpen(!notifOpen)} />
      {canNotify && <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />}

      <div className="px-4 sm:px-6 lg:pl-0 lg:pr-6 xl:pr-8 2xl:pr-10 py-6 lg:py-8">
        <div className="flex">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-20 left-4 z-40 p-3 rounded-full bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay text-white shadow-lg shadow-ethiopian-gold/30">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <Sidebar isOpen={false} onClose={() => {}} currentView={currentView} onNavigate={setCurrentView} />
          </div>

          <div className="flex-1 min-w-0 pb-20 lg:pb-0">
            {currentView === "home" ? (
              <>
                <HeroBanner />
                <CategoriesSection />
                <PopularRestaurants />
              </>
            ) : currentView === "butcher-shop" ? (
              <ButcherOrderForm />
            ) : currentView === "bartender" ? (
              <BartenderWorkflow />
            ) : null}
          </div>
        </div>
      </div>

      <MobileNav />

      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </div>
  );
}
