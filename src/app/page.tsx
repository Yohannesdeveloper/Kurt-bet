"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed, Coffee, Leaf, Heart, Wine, Users,
  ChevronDown, Star, MapPin, Clock, Phone, ArrowRight,
  Check, Menu, X, Quote, Play, Instagram, Facebook,
  ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";

const COLORS = {
  primary: "#3E2723",
  gold: "#C89B3C",
  red: "#A12222",
  cream: "#F8F4EE",
  dark: "#1B1B1B",
};

interface MenuDish { id: string; name: string; description: string; price: number; image?: string; isAvailable: boolean; }

const features = [
  { icon: UtensilsCrossed, title: "Fresh Premium Beef Daily", desc: "100% fresh Ethiopian beef sourced daily from local farms" },
  { icon: Coffee, title: "Traditional Preparation", desc: "Time-honored recipes passed down through generations" },
  { icon: Leaf, title: "Fresh Local Ingredients", desc: "Hand-picked spices and produce from Ethiopian markets" },
  { icon: Heart, title: "Authentic Family Experience", desc: "Warm hospitality that feels like home" },
  { icon: Wine, title: "Traditional Drinks", desc: "Fresh tej, tella, and Ethiopian coffee ceremony" },
  { icon: Users, title: "Cultural Heritage", desc: "Dine with traditional music and Ethiopian decor" },
];

const testimonials = [
  { name: "Sarah M.", text: "The most incredible Ethiopian dining experience outside of Addis Ababa. The kurt is absolutely world-class.", rating: 5 },
  { name: "David K.", text: "I've traveled across Ethiopia and this place captures the authentic taste perfectly. A true gem.", rating: 5 },
  { name: "Meron T.", text: "Finally, a restaurant that honors our traditions with such care and excellence.", rating: 5 },
  { name: "James R.", text: "The atmosphere, the food, the coffee ceremony — every detail is perfection. Highly recommended.", rating: 5 },
];

const whyChooseUs = [
  "100% Fresh Daily", "Premium Ethiopian Beef", "Traditional Recipes",
  "Certified Hygiene", "Friendly Staff", "Fast Service",
  "Beautiful Atmosphere", "Family Friendly",
];

const galleryImages = [
  { label: "Kurt Bet Special", image: "/images/kurt.jpg", color: "from-amber-900/60 to-amber-950/60" },
  { label: "Kitfo", image: "/images/kifo.jpg", color: "from-red-900/60 to-red-950/60" },
  { label: "Tibs", image: "/images/tibs.jpg", color: "from-stone-900/60 to-stone-950/60" },
  { label: "Gored Gored", image: "/images/gored gored.jpg", color: "from-amber-800/60 to-amber-950/60" },
  { label: "Awaze Tibs", image: "/images/Awaze Tibs.jpg", color: "from-emerald-900/60 to-emerald-950/60" },
  { label: "Zilzil Tibs", image: "/images/zilzil tibs.jpg", color: "from-yellow-900/60 to-yellow-950/60" },
];

const specialOffers = [
  { title: "Weekend Special", desc: "15% off on all orders above 1000 ETB", badge: "Weekend" },
  { title: "Family Package", desc: "Sample platter for 4 with coffee ceremony", badge: "Popular" },
  { title: "Coffee & Kurt", desc: "Traditional coffee ceremony + Kurt combo", badge: "Best Value" },
];

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useScrollAnimation();
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">{label}</span>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 text-[#3E2723]">{title}</h2>
      {subtitle && <p className="text-lg text-[#3E2723]/70 mt-4 max-w-2xl mx-auto">{subtitle}</p>}
      <div className="w-20 h-1 bg-[#C89B3C] mx-auto mt-6 rounded-full" />
    </div>
  );
}

function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAuthenticated = !!session;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "About", "Menu", "Gallery", "Contact"];
  const scrolledStyles = scrolled ? "text-[#3E2723]/80" : "text-white/80";
  const hoverStyles = "hover:text-[#C89B3C] transition-colors";

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg ${scrolled ? "text-[#3E2723]" : "text-white"}`}>Kurt Bet</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className={`text-sm tracking-wider uppercase ${scrolledStyles} ${hoverStyles}`}>{l}</a>
          ))}
          <a href="/dashboard" className="px-5 py-2.5 rounded-full bg-[#C89B3C] text-white text-sm font-semibold hover:bg-[#A12222] transition-all duration-300 shadow-lg hover:shadow-xl">
            Dashboard
          </a>
          {isAuthenticated && (
            <a href="/orders" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-semibold hover:shadow-xl hover:shadow-[#C89B3C]/30 transition-all duration-300">
              My Orders
            </a>
          )}
        </div>
        <button className="md:hidden text-[#C89B3C]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white/95 backdrop-blur-xl border-t overflow-hidden">
            <div className="px-6 py-4 space-y-3">
              {links.map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block text-[#3E2723] font-medium">{l}</a>
              ))}
              <a href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-[#3E2723] font-medium">Dashboard</a>
              {isAuthenticated && (
                <a href="/orders" onClick={() => setMenuOpen(false)} className="block text-center px-6 py-3 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold">
                  My Orders
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3E2723]/90 via-[#1B1B1B]/95 to-[#A12222]/80 z-10" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #C89B3C 0%, transparent 50%), radial-gradient(circle at 70% 30%, #A12222 0%, transparent 40%), radial-gradient(circle at 50% 80%, #3E2723 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C89B3C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
          <span className="inline-block px-6 py-2 rounded-full border border-[#C89B3C]/40 text-[#C89B3C] text-sm tracking-widest uppercase bg-[#C89B3C]/10 backdrop-blur-sm">
            Authentic Ethiopian Cuisine
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white leading-tight mb-6">
          Experience Authentic
          <br />
          <span className="bg-gradient-to-r from-[#C89B3C] via-[#F5D980] to-[#C89B3C] bg-clip-text text-transparent">Ethiopian Cuisine</span>
          <br />
          Like Never Before
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto mb-8 lg:mb-10 leading-relaxed">
          Freshly prepared every day using premium Ethiopian beef, traditional spices, and generations of culinary heritage passed down through our family.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/menu" className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold text-lg hover:shadow-2xl hover:shadow-[#C89B3C]/40 transition-all duration-500 hover:scale-105">
            View Our Menu
            <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/dashboard" className="group px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300">
            Order Now
          </a>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureHighlights() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Why Choose Us" title="The Kurt Bet Experience" subtitle="Every detail crafted to bring you the authentic taste of Ethiopia" />
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -8 }} className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#C89B3C]/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-7 h-7 text-[#A12222]" />
                </div>
                <h3 className="text-xl font-bold text-[#3E2723] mb-2">{f.title}</h3>
                <p className="text-[#3E2723]/70 leading-relaxed">{f.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <AnimatedSection>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#3E2723] to-[#1B1B1B] overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <UtensilsCrossed className="w-16 h-16 text-[#C89B3C] mx-auto mb-4" />
                    <p className="text-[#C89B3C] text-2xl font-bold">Generations of</p>
                    <p className="text-white text-4xl font-bold">Excellence</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#A12222] flex items-center justify-center shadow-xl">
                <p className="text-white text-center font-bold text-sm">
                  <span className="text-3xl">56+</span>
                  <br />Years
                </p>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 text-[#3E2723]">A Legacy of Ethiopian Culinary Tradition</h2>
            <div className="w-20 h-1 bg-[#C89B3C] mt-6 rounded-full" />
            <p className="text-lg text-[#3E2723]/70 mt-8 leading-relaxed">
              Welcome to Kurt Bet, where the ancient tradition of Ethiopian Tere Sega meets modern luxury. Our family has been perfecting the art of raw beef preparation for generations, using time-honored recipes that celebrate the rich flavors of Ethiopia.
            </p>
            <p className="text-lg text-[#3E2723]/70 mt-4 leading-relaxed">
              Every dish tells a story — from the premium Ethiopian beef we source daily to the traditional mitmita and niter kibbeh that give our cuisine its distinctive character. We invite you to experience the warmth of Ethiopian hospitality, the richness of our culture, and the unforgettable taste of authenticity.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-10">
              {[
                { value: "56+", label: "Years of Tradition", color: "text-[#C89B3C]" },
                { value: "1K+", label: "Happy Guests", color: "text-[#A12222]" },
                { value: "100%", label: "Fresh Daily", color: "text-green-600" },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-[#3E2723]/60 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function SignatureDishes() {
  const [dishes, setDishes] = useState<MenuDish[]>([]);
  useEffect(() => {
    fetch("/api/menu").then(r => r.json()).then(d => {
      if (d.success) setDishes((d.data.items || []).filter((i: any) => i.isAvailable !== false).slice(0, 6));
    }).catch(() => {});
  }, []);
  return (
    <section id="menu" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Signature Dishes" title="Our Specialties" subtitle="Handcrafted with premium Ethiopian ingredients and generations of tradition" />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {dishes.map((dish, i) => (
            <AnimatedSection key={dish.id} delay={i * 0.1}>
              <motion.div whileHover={{ y: -8 }} className="group rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#3E2723] to-[#1B1B1B]">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UtensilsCrossed className="w-12 h-12 text-[#C89B3C] opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#C89B3C] text-white text-xs font-bold shadow-lg">
                    Bestseller
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#3E2723]">{dish.name}</h3>
                    <span className="text-2xl font-bold text-[#C89B3C]">{dish.price} ETB</span>
                  </div>
                  <p className="text-[#3E2723]/70 text-sm leading-relaxed line-clamp-2">{dish.description}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveKitchenSection() {
  const steps = [
    { step: "01", title: "Select Meat", desc: "Premium Ethiopian beef hand-selected daily" },
    { step: "02", title: "Fresh Preparation", desc: "Traditional cleaning and preparation" },
    { step: "03", title: "Traditional Seasoning", desc: "Mitmita, niter kibbeh, and secret spices" },
    { step: "04", title: "Expert Cutting", desc: "Masterful cutting by our experienced chefs" },
    { step: "05", title: "Serve Fresh", desc: "Presented with traditional injera and sides" },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#1B1B1B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 30% 50%, #C89B3C 0%, transparent 50%), radial-gradient(circle at 70% 80%, #A12222 0%, transparent 40%)`,
      }} />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">Live Kitchen</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 text-white">The Art of Preparation</h2>
            <p className="text-lg text-white/60 mt-4 max-w-2xl mx-auto">Watch our master chefs transform premium ingredients into unforgettable dishes</p>
            <div className="w-20 h-1 bg-[#C89B3C] mx-auto mt-6 rounded-full" />
          </div>
        </AnimatedSection>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C89B3C] via-[#A12222] to-transparent hidden md:block" />
          <div className="space-y-12">
            {steps.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.15}>
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
                  <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#A12222] text-white font-bold text-xl relative z-10 shadow-xl flex-shrink-0">
                    {s.step}
                  </div>
                  <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-[#C89B3C]/30 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-white/60">{s.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Why Choose Us" title="Excellence in Every Detail" />
        </AnimatedSection>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
          {whyChooseUs.map((item, i) => (
            <AnimatedSection key={item} delay={i * 0.05}>
              <motion.div whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-[#F8F4EE] border border-transparent hover:border-[#C89B3C]/30 transition-all duration-300 text-center group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-[#A12222]" />
                </div>
                <p className="font-semibold text-[#3E2723]">{item}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Gallery" title="Our World" subtitle="Step inside the Kurt Bet experience" />
        </AnimatedSection>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              onClick={() => setSelected(i)}
            >
              <img src={img.image} alt={img.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className={`absolute inset-0 bg-gradient-to-br ${img.color} mix-blend-overlay`} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-lg drop-shadow-lg">{img.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="max-w-4xl w-full aspect-video rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <img src={galleryImages[selected].image} alt={galleryImages[selected].label} className="w-full h-full object-cover" />
            </motion.div>
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setSelected(null)}><X className="w-8 h-8" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#1B1B1B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 80% 20%, #C89B3C 0%, transparent 40%)`,
      }} />
      <div className="max-w-4xl lg:max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 text-white">What Our Guests Say</h2>
            <div className="w-20 h-1 bg-[#C89B3C] mx-auto mt-6 rounded-full" />
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div className="relative">
            <Quote className="w-16 h-16 text-[#C89B3C]/20 absolute -top-4 -left-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={idx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8 px-4"
              >
                <p className="text-2xl md:text-3xl text-white/90 italic leading-relaxed mb-8">"{testimonials[idx].text}"</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {Array.from({ length: testimonials[idx].rating }).map((_, i) => <Star key={i} className="w-5 h-5 fill-[#C89B3C] text-[#C89B3C]" />)}
                </div>
                <p className="text-white font-semibold text-lg">{testimonials[idx].name}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-3 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === idx ? "bg-[#C89B3C] w-8" : "bg-white/30"}`} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function CultureSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Our Heritage" title="Ethiopian Culinary Tradition" subtitle="Centuries of culture, hospitality, and flavor" />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {[
            { title: "History of Kurt", desc: "Kurt (or Kitfo) has been a cornerstone of Ethiopian cuisine for centuries, originating in the highlands where fresh raw beef was celebrated as a symbol of prosperity and tradition." },
            { title: "Tere Sega Tradition", desc: "Tere Sega — literally 'fresh meat' — represents the pinnacle of Ethiopian culinary art, prepared with precision and served with respect for ancient customs." },
            { title: "Ethiopian Hospitality", desc: "In Ethiopian culture, sharing a meal is the highest form of friendship. Our restaurant embodies 'Dejenna' — the spirit of warm, generous hospitality." },
            { title: "Coffee Ceremony", desc: "No Ethiopian meal is complete without the traditional coffee ceremony — a ritual of roasting, brewing, and sharing that symbolizes community and connection." },
          ].map((c, i) => (
            <AnimatedSection key={c.title} delay={i * 0.1}>
              <div className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[#C89B3C]">
                <h3 className="text-xl font-bold text-[#3E2723] mb-3">{c.title}</h3>
                <p className="text-[#3E2723]/70 leading-relaxed">{c.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialOffers() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-[#3E2723] to-[#1B1B1B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, #C89B3C 0%, transparent 60%)`,
      }} />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">Special Offers</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 text-white">Exclusive Deals</h2>
            <div className="w-20 h-1 bg-[#C89B3C] mx-auto mt-6 rounded-full" />
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {specialOffers.map((offer, i) => (
            <AnimatedSection key={offer.title} delay={i * 0.15}>
              <motion.div whileHover={{ y: -8 }} className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#C89B3C]/30 transition-all duration-300 text-center group">
                <span className="inline-block px-3 py-1 rounded-full bg-[#C89B3C]/20 text-[#C89B3C] text-xs font-bold mb-4">{offer.badge}</span>
                <h3 className="text-2xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-white/60 mb-6">{offer.desc}</p>
                <a href="/menu" className="inline-flex items-center gap-2 text-[#C89B3C] font-semibold group-hover:gap-3 transition-all">
                  Claim Offer <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label="Visit Us" title="Find Kurt Bet" />
        </AnimatedSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-[#3E2723] to-[#1B1B1B] flex items-center justify-center">
              <MapPin className="w-16 h-16 text-[#C89B3C]" />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: "123 Ethiopian Avenue, Addis Ababa" },
                { icon: Clock, label: "Opening Hours", value: "Mon-Sun: 11:00 AM - 11:00 PM" },
                { icon: Phone, label: "Reservations", value: "+251 911 234 567" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#A12222]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#3E2723]/60">{item.label}</p>
                    <p className="text-lg font-semibold text-[#3E2723]">{item.value}</p>
                  </div>
                </div>
              ))}
              <a href="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold hover:shadow-xl hover:shadow-[#C89B3C]/30 transition-all duration-300">
                <MapPin className="w-5 h-5" /> Get Directions
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#1B1B1B] text-white/60">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Kurt Bet</span>
            </div>
            <p className="text-sm leading-relaxed">Experience the authentic taste of Ethiopian Tere Sega, crafted with tradition and served with love.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {["Home", "About", "Menu", "Gallery", "Contact"].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="block hover:text-[#C89B3C] transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Opening Hours</h4>
            <div className="space-y-2 text-sm">
              <p>Monday - Sunday</p>
              <p className="text-white font-semibold">11:00 AM - 11:00 PM</p>
              <p className="mt-4">Coffee Ceremony</p>
              <p className="text-white font-semibold">3:00 PM - 6:00 PM</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-3 mb-6">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#C89B3C]/20 hover:text-[#C89B3C] transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <h4 className="font-semibold text-white mb-3">Newsletter</h4>
            <div className="flex">
              <input type="email" placeholder="Your email" className="flex-1 px-4 py-2.5 rounded-l-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C89B3C]" />
              <button className="px-4 py-2.5 rounded-r-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-semibold">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>&copy; 2024 Kurt Bet. All rights reserved. Proudly Ethiopian.</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const { status } = useSession();
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B1B1B]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <UtensilsCrossed className="w-8 h-8 text-[#C89B3C]" />
      </motion.div>
    </div>
  );
  return (
    <div className="bg-[#F8F4EE]">
      <FloatingNav />
      <HeroSection />
      <FeatureHighlights />
      <AboutSection />
      <SignatureDishes />
      <LiveKitchenSection />
      <WhyChooseUs />
      <GallerySection />
      <TestimonialsSection />
      <CultureSection />
      <SpecialOffers />
      <LocationSection />
      <Footer />
    </div>
  );
}
