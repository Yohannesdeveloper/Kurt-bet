"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, ShoppingCart, User, MapPin, Star, Clock,
  ChevronRight, Home, UtensilsCrossed, Receipt,
  Heart, Percent, Menu, X, ChevronLeft,
  ChevronRight as ChevronRightIcon, Sparkles, Flame,
  Zap, TrendingUp, Store, CookingPot, ClipboardList, Users, LogOut,
  Beef, Check, XCircle, Send
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

const COLORS = {
  primary: "#3E2723",
  gold: "#C89B3C",
  red: "#A12222",
  cream: "#F8F4EE",
  dark: "#1B1B1B",
};

const categories = [
  { name: "Tere Sega", count: 28, image: "/images/kurt.jpg", color: "from-red-600 to-red-800", bg: "bg-red-50" },
  { name: "Kitfo", count: 24, image: "/images/kifo.jpg", color: "from-amber-600 to-amber-800", bg: "bg-amber-50" },
  { name: "Tibs", count: 32, image: "/images/tibs.jpg", color: "from-orange-600 to-orange-800", bg: "bg-orange-50" },
  { name: "Gored Gored", count: 19, image: "/images/gored gored.jpg", color: "from-stone-600 to-stone-800", bg: "bg-stone-50" },
  { name: "Awaze Tibs", count: 15, image: "/images/Awaze Tibs.jpg", color: "from-red-700 to-red-900", bg: "bg-red-50" },
  { name: "Zilzil Tibs", count: 22, image: "/images/zilzil tibs.jpg", color: "from-amber-700 to-amber-900", bg: "bg-amber-50" },
];

const restaurants = [
  {
    name: "Kurt Bet Special",
    rating: 4.9,
    deliveryTime: "30-45",
    price: "ETB 500",
    image: "/images/kurt.jpg",
    color: "from-red-700 to-red-900",
    tags: ["Tere Sega", "Traditional"],
    featured: true,
    discount: "20% OFF"
  },
  {
    name: "Addis Kitfo House",
    rating: 4.8,
    deliveryTime: "25-40",
    price: "ETB 450",
    image: "/images/kifo.jpg",
    color: "from-amber-700 to-amber-900",
    tags: ["Kitfo", "Authentic"],
    featured: true,
    discount: "15% OFF"
  },
  {
    name: "Tibs Palace",
    rating: 4.7,
    deliveryTime: "35-50",
    price: "ETB 380",
    image: "/images/tibs.jpg",
    color: "from-orange-700 to-orange-900",
    tags: ["Tibs", "Spicy"],
    featured: false,
    discount: null
  },
  {
    name: "Gored Gored House",
    rating: 4.6,
    deliveryTime: "20-35",
    price: "ETB 420",
    image: "/images/gored gored.jpg",
    color: "from-stone-700 to-stone-900",
    tags: ["Gored Gored", "Fresh"],
    featured: false,
    discount: null
  },
];

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: UtensilsCrossed, label: "Menu", href: "/menu" },
  { icon: Store, label: "Tables", href: "/tables" },
  { icon: Receipt, label: "Orders", href: "/orders" },
  { icon: CookingPot, label: "Kitchen", href: "/kds" },
  { icon: ClipboardList, label: "Inventory", href: "/inventory" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: Percent, label: "Reports", href: "/reports" },
  { icon: Beef, label: "Butcher Shop", href: "/dashboard/butcher-shop" },
];

function Header({ onCartClick }: { onCartClick: () => void }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-sm"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-20 2xl:h-24">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] opacity-30 blur-sm"
              />
            </div>
            <span className="font-bold text-xl text-[#3E2723] bg-gradient-to-r from-[#3E2723] to-[#C89B3C] bg-clip-text text-transparent">
              Kurt Bet
            </span>
          </motion.div>

          {/* Location */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#C89B3C]/10 to-[#A12222]/10 text-[#3E2723]/70 hover:text-[#C89B3C] cursor-pointer transition-colors border border-[#C89B3C]/20"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Addis Ababa, Ethiopia</span>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-4 lg:mx-8">
            <motion.div
              animate={{ scale: searchFocused ? 1.02 : 1 }}
              className="relative w-full"
            >
              <motion.div
                animate={{ scale: searchFocused ? 1.1 : 1 }}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <Search className={`w-5 h-5 transition-colors ${searchFocused ? "text-[#C89B3C]" : "text-gray-400"}`} />
              </motion.div>
              <input
                type="text"
                placeholder="Search for food, restaurants, cuisines..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-transparent focus:border-[#C89B3C]/50 focus:bg-white focus:shadow-lg focus:shadow-[#C89B3C]/20 outline-none transition-all duration-300 text-sm"
              />
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#C89B3C]/10 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-[#C89B3C]" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gradient-to-r hover:from-[#C89B3C]/10 hover:to-[#A12222]/10 transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-[#3E2723] group-hover:text-[#C89B3C] transition-colors" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 w-2 h-2 bg-[#A12222] rounded-full"
              />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#A12222] flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {session?.user?.name?.charAt(0) || "J"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-sm font-medium text-[#3E2723] hidden lg:block">
                {session?.user?.name || "John Doe"}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden pb-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food, restaurants..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 outline-none text-sm border border-gray-200 focus:border-[#C89B3C]/50 transition-colors"
            />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 lg:w-64 xl:w-72 2xl:w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:shadow-lg lg:translate-x-0 lg:block`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 mb-8 cursor-pointer"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] opacity-30 blur-sm"
              />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#3E2723] to-[#C89B3C] bg-clip-text text-transparent">
              Kurt Bet
            </span>
          </motion.div>

          {/* Promo Banner */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#A12222] p-6 mb-8 text-white shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" />
                <p className="text-xs font-semibold tracking-wider uppercase">Limited Time</p>
              </div>
              <p className="text-2xl font-bold mb-1">Get 50% OFF</p>
              <p className="text-sm opacity-90 mb-3">on your first order</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold cursor-pointer border border-white/30"
              >
                Code: FOOD50
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#3E2723]/70 hover:bg-gradient-to-r hover:from-[#C89B3C]/10 hover:to-[#A12222]/10 hover:text-[#C89B3C] transition-all duration-200 group border border-transparent hover:border-[#C89B3C]/20"
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="relative"
                >
                  <item.icon className="w-5 h-5" />
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="absolute -inset-1 bg-[#C89B3C]/20 rounded-lg blur-sm"
                  />
                </motion.div>
                <span className="font-medium">{item.label}</span>
              </motion.a>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-200 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Logout</p>
                <p className="text-xs text-red-500/70">End your session</p>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#1B1B1B] to-[#A12222] p-6 sm:p-8 lg:p-12 xl:p-16 text-white shadow-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-[#C89B3C]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#A12222]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#C89B3C]/20 rounded-full blur-2xl"
        />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-2 h-2 bg-[#C89B3C] rounded-full blur-sm"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
                } as CSSProperties}
        />
      ))}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C89B3C]/30 to-[#A12222]/30 border border-[#C89B3C]/50 backdrop-blur-sm mb-6"
            >
              <Zap className="w-4 h-4 text-[#C89B3C]" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#C89B3C]">Hot Deal</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
              Delicious food,
              <br />
              <span className="bg-gradient-to-r from-[#C89B3C] via-[#F5D980] to-[#C89B3C] bg-clip-text text-transparent">
                delivered fast
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base lg:text-lg xl:text-xl mb-6 lg:mb-8 max-w-md lg:max-w-lg leading-relaxed">
              Order from your favorite restaurants and get it delivered to your doorstep in minutes.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-[#C89B3C]/40 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <span className="relative flex items-center gap-2">
                Order Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </div>

        <div className="hidden lg:flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-3xl bg-gradient-to-br from-[#C89B3C]/30 to-[#A12222]/30 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full"
              >
                <img
                  src="/images/kurt.jpg"
                  alt="Ethiopian Tere Sega"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-bold shadow-lg border-2 border-white/30"
            >
              30% OFF
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30"
            >
              Free Delivery
            </motion.div>

            {/* Sparkle Effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                className="absolute w-3 h-3"
                style={{
                  top: `${20 + i * 20}%`,
                  right: `${10 + i * 15}%`,
          } as CSSProperties}
              >
                <Sparkles className="w-full h-full text-[#C89B3C]" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-[#3E2723] to-[#C89B3C] bg-clip-text text-transparent"
        >
          Categories
        </motion.h2>
        <motion.a
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          href="/menu"
          className="text-[#C89B3C] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all group"
        >
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
          >
            <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${category.color} p-4 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 overflow-hidden`}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl transition-opacity" />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold"
              >
                Explore
              </motion.div>
              {/* Glow effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.5, opacity: 0.3 }}
                className="absolute inset-0 bg-white rounded-2xl blur-xl"
              />
            </div>
            <motion.p
              whileHover={{ scale: 1.05 }}
              className="text-center font-semibold text-[#3E2723] text-sm group-hover:text-[#C89B3C] transition-colors"
            >
              {category.name}
            </motion.p>
            <p className="text-center text-xs text-[#3E2723]/60">{category.count} restaurants</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: typeof restaurants[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-300">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${restaurant.color} flex items-center justify-center`}
        >
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Discount Badge */}
        {restaurant.discount && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-xs font-bold shadow-lg border-2 border-white/30"
          >
            {restaurant.discount}
          </motion.div>
        )}

        {/* Price Badge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#3E2723] shadow-md border border-gray-200"
        >
          {restaurant.price}
        </motion.div>

        {/* Featured Badge */}
        {restaurant.featured && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1 shadow-md"
          >
            <TrendingUp className="w-3 h-3 text-[#C89B3C]" />
            <span className="text-xs font-semibold text-[#3E2723]">Featured</span>
          </motion.div>
        )}

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity"
        />

        {/* Quick Action Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          className="absolute bottom-3 left-3 right-3 px-4 py-2 rounded-full bg-white text-[#3E2723] font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Order Now
        </motion.button>
      </div>

      <div className="space-y-2">
        <motion.h3
          whileHover={{ scale: 1.02 }}
          className="font-bold text-[#3E2723] text-lg group-hover:text-[#C89B3C] transition-colors"
        >
          {restaurant.name}
        </motion.h3>

        <div className="flex items-center gap-4 text-sm">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-1"
          >
            <Star className="w-4 h-4 fill-[#C89B3C] text-[#C89B3C]" />
            <span className="font-semibold text-[#3E2723]">{restaurant.rating}</span>
          </motion.div>
          <div className="flex items-center gap-1 text-[#3E2723]/60">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime} min</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <motion.span
              key={tag}
              whileHover={{ scale: 1.05 }}
              className="px-2 py-1 rounded-full bg-gradient-to-r from-[#F8F4EE] to-[#F8F4EE]/50 text-xs text-[#3E2723]/70 border border-[#C89B3C]/20"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PopularRestaurants() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#3E2723]">Popular Restaurants</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="p-2 rounded-full border border-gray-200 hover:border-[#C89B3C] hover:bg-[#C89B3C]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 text-[#3E2723]" />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(restaurants.length - 4, currentIndex + 1))}
            className="p-2 rounded-full border border-gray-200 hover:border-[#C89B3C] hover:bg-[#C89B3C]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex >= restaurants.length - 4}
          >
            <ChevronRightIcon className="w-5 h-5 text-[#3E2723]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard key={restaurant.name} restaurant={restaurant} index={index} />
        ))}
      </div>
    </section>
  );
}

function MobileNav() {
  const mobileNavItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Receipt, label: "Orders", href: "/orders" },
    { icon: Heart, label: "Favorites", href: "/menu" },
    { icon: User, label: "Profile", href: "/settings" },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 lg:hidden z-50 shadow-2xl"
    >
      <div className="flex items-center justify-around py-3">
        {mobileNavItems.map((item, index) => (
          <motion.a
            key={item.label}
            href={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 text-[#3E2723]/60 hover:text-[#C89B3C] transition-colors group relative"
          >
            <motion.div
              whileHover={{ y: -3 }}
              className="relative"
            >
              <item.icon className="w-5 h-5" />
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="absolute -inset-2 bg-[#C89B3C]/20 rounded-full blur-md"
              />
            </motion.div>
            <span className="text-xs font-medium group-hover:font-semibold transition-all">{item.label}</span>
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const cartItems = [
    { name: "Kurt Special", qty: 2, price: 450 },
    { name: "Kitfo", qty: 1, price: 350 },
  ];
  const total = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const menuRes = await fetch("/api/menu");
      const menuData = await menuRes.json();
      const menuItems = menuData.success ? (menuData.data?.items || menuData.data || []) : [];

      const items = cartItems.map((ci) => {
        const match = menuItems.find(
          (m: { name: string; id: string; price: number }) =>
            m.name.toLowerCase().includes(ci.name.toLowerCase().split(" ")[0].toLowerCase())
        );
        return {
          menuItemId: match?.id || "demo",
          name: ci.name,
          quantity: ci.qty,
          unitPrice: ci.price,
          totalPrice: ci.qty * ci.price,
        };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DINE_IN",
          guestCount: 1,
          subtotal: total,
          total,
          items,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order #${data.data.orderNumber} placed!`);
        onClose();
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
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-[#3E2723]">Your Cart</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F4EE]">
                <div>
                  <p className="text-sm font-semibold text-[#3E2723]">{item.name}</p>
                  <p className="text-xs text-[#3E2723]/60">Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-[#C89B3C]">ETB {item.qty * item.price}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#3E2723]">Total</span>
              <span className="text-lg font-bold text-[#C89B3C]">ETB {total}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? "Placing Order..." : "Checkout"}
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

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <Header onCartClick={() => setCartOpen(!cartOpen)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="px-4 sm:px-6 lg:pl-0 lg:pr-6 xl:pr-8 2xl:pr-10 py-6 lg:py-8">
        <div className="flex">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-20 left-4 z-40 p-3 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#A12222] text-white shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Sidebar */}
          <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <Sidebar isOpen={false} onClose={() => {}} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">
            <HeroBanner />
            <CategoriesSection />
            <PopularRestaurants />
          </div>
        </div>
      </div>

      <MobileNav />

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}
