"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, ShoppingCart, User, MapPin, Star, Clock,
  ChevronRight, Home, UtensilsCrossed, Receipt,
  Heart, Percent, Menu, X, ChevronLeft,
  ChevronRight as ChevronRightIcon, Sparkles, Flame,
  Zap, TrendingUp, Store, CookingPot, ClipboardList, Users, LogOut,
  Beef, Check, XCircle, Send, Minus, Plus, Gem, Award
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { EthiopianCornerSet, JebenaIcon, MesobIcon, InjeraIcon } from "@/components/shared/ethiopian-patterns";
import { GoldButton } from "@/components/shared/section-header";

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
  kurtBetSpecial: { rating: 4.9, deliveryTime: "30-45", price: "ETB 500", image: "/images/kurt.jpg", color: "from-ethiopian-burgundy to-ethiopian-charcoal", tagKeys: ["tereSega", "traditional"], featured: true, discount: "20% OFF" },
  addisKitfoHouse: { rating: 4.8, deliveryTime: "25-40", price: "ETB 450", image: "/images/kifo.jpg", color: "from-ethiopian-gold to-ethiopian-coffee", tagKeys: ["kitfo", "authentic"], featured: true, discount: "15% OFF" },
  tibsPalace: { rating: 4.7, deliveryTime: "35-50", price: "ETB 380", image: "/images/tibs.jpg", color: "from-ethiopian-earth to-ethiopian-charcoal", tagKeys: ["tibs", "spicy"], featured: false, discount: null },
  goredGoredHouse: { rating: 4.6, deliveryTime: "20-35", price: "ETB 420", image: "/images/gored gored.jpg", color: "from-ethiopian-coffee to-ethiopian-charcoal", tagKeys: ["goredGored", "fresh"], featured: false, discount: null },
};

function Header({ onCartClick }: { onCartClick: () => void }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const { t } = useTranslation();

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchRef.current?.value.trim()) {
      window.location.href = `/menu?search=${encodeURIComponent(searchRef.current.value.trim())}`;
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-ethiopian-cream/95 backdrop-blur-xl border-b border-ethiopian-gold/10 shadow-sm"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-20 2xl:h-24">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-25 blur-sm"
              />
            </div>
            <span className="font-bold text-xl font-serif bg-gradient-to-r from-ethiopian-coffee to-ethiopian-gold bg-clip-text text-transparent">
              {t("brand.name")}
            </span>
          </motion.div>

          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-4 lg:mx-8">
            <motion.div animate={{ scale: searchFocused ? 1.02 : 1 }} className="relative w-full">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? "text-ethiopian-gold" : "text-gray-400"}`} />
              <input
                ref={searchRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-gradient-to-r from-ethiopian-sand/30 to-ethiopian-cream border-2 border-transparent focus:border-ethiopian-gold/40 focus:bg-white focus:shadow-lg focus:shadow-ethiopian-gold/10 outline-none transition-all duration-300 text-sm"
              />
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-ethiopian-gold/10 to-ethiopian-clay/10 text-ethiopian-coffee/70 hover:text-ethiopian-gold cursor-pointer transition-colors border border-ethiopian-gold/20">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{t("header.location")}</span>
          </motion.div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gradient-to-r hover:from-ethiopian-gold/10 hover:to-ethiopian-clay/10 transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-ethiopian-coffee group-hover:text-ethiopian-gold transition-colors" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 w-2 h-2 bg-ethiopian-clay rounded-full"
              />
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} className="hidden sm:flex items-center gap-3 pl-3 border-l border-ethiopian-gold/20 cursor-pointer">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {(session?.user?.email || "J").charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-ethiopian-cream" />
              </div>
              <span className="text-sm font-medium text-ethiopian-coffee hidden lg:block">
                {session?.user?.email || "user@email.com"}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={t("header.mobileSearchPlaceholder")} className="w-full pl-12 pr-4 py-3 rounded-full bg-gradient-to-r from-ethiopian-sand/30 to-ethiopian-cream outline-none text-sm border border-ethiopian-gold/10 focus:border-ethiopian-gold/40 transition-colors" />
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

  const allNavItems = [
    { icon: Home, label: t("nav.dashboard"), href: "/dashboard", key: "dashboard" },
    { icon: UtensilsCrossed, label: t("nav.menu"), href: "/menu", key: "menu" },
    { icon: Store, label: t("nav.tables"), href: "/tables", key: "tables" },
    { icon: Receipt, label: t("nav.orders"), href: "/orders", key: "orders" },
    { icon: CookingPot, label: t("nav.kitchen"), href: "/kds", key: "kitchen" },
    { icon: ClipboardList, label: t("nav.inventory"), href: "/inventory", key: "inventory" },
    { icon: Users, label: t("nav.employees"), href: "/employees", key: "employees" },
    { icon: Percent, label: t("nav.reports"), href: "/reports", key: "reports" },
    { icon: Beef, label: t("nav.butcherShop"), href: "/dashboard/butcher", key: "butcher" },
  ];

  const hiddenForClient = new Set(["inventory", "employees", "reports"]);
  const hiddenForWaiter = new Set(["inventory", "employees", "reports"]);
  const navItems = allNavItems.filter((item) => {
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

      <aside className={`fixed top-0 left-0 h-full w-72 lg:w-64 xl:w-72 2xl:w-80 bg-ethiopian-cream shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:shadow-lg lg:translate-x-0 lg:block`}>
        <div className="p-6 h-full flex flex-col">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 mb-8 cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-1 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-25 blur-sm" />
            </div>
            <span className="font-bold text-xl font-serif bg-gradient-to-r from-ethiopian-coffee to-ethiopian-gold bg-clip-text text-transparent">
              {t("brand.name")}
            </span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay p-6 mb-8 text-white shadow-lg">
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
                  } else if (item.href.startsWith("/dashboard")) {
                    window.location.href = item.href;
                  } else {
                    window.location.href = item.href;
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent ${
                  currentView === (item.href === "/dashboard" ? "home" : undefined)
                    ? "bg-gradient-to-r from-ethiopian-gold/10 to-ethiopian-clay/10 text-ethiopian-gold border-ethiopian-gold/20"
                    : "text-ethiopian-coffee/70 hover:bg-gradient-to-r hover:from-ethiopian-gold/10 hover:to-ethiopian-clay/10 hover:text-ethiopian-gold hover:border-ethiopian-gold/20"
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
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200/50 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-200 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">{t("sidebar.logout")}</p>
                <p className="text-xs text-red-500/70">{t("sidebar.endSession")}</p>
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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-burgundy p-6 sm:p-8 lg:p-12 xl:p-16 text-white shadow-2xl">
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
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-serif font-bold bg-gradient-to-r from-ethiopian-coffee to-ethiopian-gold bg-clip-text text-transparent">
          {t("dashboard.categories")}
        </motion.h2>
        <motion.a initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} href="/menu" className="text-ethiopian-gold font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all group">
          {t("common.viewAll")} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.a>
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
              <motion.p whileHover={{ scale: 1.05 }} className="text-center font-semibold text-ethiopian-coffee text-sm group-hover:text-ethiopian-gold transition-colors">
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
  const restaurant = restaurantMeta[restKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onClick={() => window.location.href = "/menu"}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-ethiopian-sand to-ethiopian-cream mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 opacity-[0.06] bg-ethiopian-cross pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }} className={`absolute inset-0 bg-gradient-to-br ${restaurant.color} flex items-center justify-center`}>
          <img src={restaurant.image} alt={t(`restaurant.${restKey}`)} className="w-full h-full object-cover" />
        </motion.div>

        {restaurant.discount && (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white text-xs font-bold shadow-lg border-2 border-white/30">
            {restaurant.discount}
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-ethiopian-coffee shadow-md border border-ethiopian-gold/20">
          {restaurant.price}
        </motion.div>

        {restaurant.featured && (
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3 text-ethiopian-gold" />
            <span className="text-xs font-semibold text-ethiopian-coffee">{t("restaurant.featured")}</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity" />

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          onClick={() => window.location.href = "/menu"}
          className="absolute bottom-3 left-3 right-3 px-4 py-2 rounded-full bg-white text-ethiopian-coffee font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {t("restaurant.orderNow")}
        </motion.button>
      </div>

      <div className="space-y-2">
        <motion.h3 whileHover={{ scale: 1.02 }} className="font-bold font-serif text-ethiopian-coffee text-lg group-hover:text-ethiopian-gold transition-colors">
          {t(`restaurant.${restKey}`)}
        </motion.h3>
        <div className="flex items-center gap-4 text-sm">
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-ethiopian-gold text-ethiopian-gold" />
            <span className="font-semibold text-ethiopian-coffee">{restaurant.rating}</span>
          </motion.div>
          <div className="flex items-center gap-1 text-ethiopian-coffee/60">
            <Clock className="w-4 h-4" />
            <span>{t("restaurant.deliveryTime", { time: restaurant.deliveryTime })}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {restaurant.tagKeys.map((tagKey) => (
            <motion.span key={tagKey} whileHover={{ scale: 1.05 }} className="px-2 py-1 rounded-full bg-gradient-to-r from-ethiopian-cream to-ethiopian-cream/50 text-xs text-ethiopian-coffee/70 border border-ethiopian-gold/20">
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
        <h2 className="text-2xl font-serif font-bold text-ethiopian-coffee">{t("dashboard.popularRestaurants")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {restaurantKeys.map((key, index) => (
          <RestaurantCard key={key} restKey={key} index={index} />
        ))}
      </div>
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
    <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-ethiopian-cream/95 backdrop-blur-xl border-t border-ethiopian-gold/10 lg:hidden z-50 shadow-2xl">
      <div className="flex items-center justify-around py-2 sm:py-3">
        {mobileNavItems.map((item, index) => (
          <motion.a key={item.label} href={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 text-ethiopian-coffee/60 hover:text-ethiopian-gold transition-colors group relative"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-medium group-hover:font-semibold transition-all">{item.label}</span>
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([
    { name: "Kurt Special", qty: 2, price: 450 },
    { name: "Kitfo", qty: 1, price: 350 },
  ]);
  const total = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const menuRes = await fetch("/api/menu");
      const menuData = await menuRes.json();
      const menuItems = menuData.success ? (menuData.data?.items || menuData.data || []) : [];
      const items = cartItems.map((ci) => {
        const match = menuItems.find((m: { name: string; id: string; price: number }) => m.name.toLowerCase().includes(ci.name.toLowerCase().split(" ")[0].toLowerCase()));
        return { menuItemId: match?.id || "demo", name: ci.name, quantity: ci.qty, unitPrice: ci.price, totalPrice: ci.qty * ci.price };
      });
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DINE_IN", guestCount: 1, subtotal: total, total, items }),
      });
      const data = await res.json();
      if (data.success) { toast.success(t("cart.orderPlaced", { orderNumber: data.data.orderNumber })); onClose(); }
      else { toast.error(data.error || t("cart.failedToPlace")); }
    } catch { toast.error(t("cart.failedToPlace")); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-ethiopian-charcoal/50 backdrop-blur-sm z-50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-ethiopian-cream shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-ethiopian-gold/10">
            <h2 className="text-lg font-bold font-serif text-ethiopian-coffee">{t("cart.yourCart")}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-ethiopian-cream transition-colors">
              <X className="w-5 h-5 text-ethiopian-coffee" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-ethiopian-gold/10">
                <div>
                  <p className="text-sm font-semibold text-ethiopian-coffee">{item.name}</p>
                  <p className="text-xs text-ethiopian-coffee/60">{t("cart.qty", { qty: item.qty })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ethiopian-gold">{t("common.currency")} {item.qty * item.price}</p>
                  <button onClick={() => setCartItems(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-ethiopian-gold/10 space-y-3 bg-white/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ethiopian-coffee">{t("cart.total")}</span>
              <span className="text-lg font-bold text-ethiopian-gold font-serif">{t("common.currency")} {total}</span>
            </div>
            <button onClick={handleCheckout} disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? t("cart.placingOrder") : t("cart.checkout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home");

  return (
    <div className="min-h-screen bg-ethiopian-cream texture-linen">
      <Header onCartClick={() => setCartOpen(!cartOpen)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

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
