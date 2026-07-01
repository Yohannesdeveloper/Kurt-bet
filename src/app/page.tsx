"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/lib/i18n";
import { QRCodeSVG } from "qrcode.react";
import {
  UtensilsCrossed, Coffee, Leaf, Heart, Wine, Users,
  ChevronDown, Star, MapPin, Clock, Phone, ArrowRight,
  Check, Menu, X, Quote, Play, Instagram, Facebook,
  ChevronLeft, ChevronRight, ExternalLink, Smartphone,
} from "lucide-react";

const COLORS = {
  primary: "#3E2723",
  gold: "#C89B3C",
  red: "#A12222",
  cream: "#F8F4EE",
  dark: "#1B1B1B",
};

interface MenuDish { id: string; name: string; description: string; price: number; image?: string; isAvailable: boolean; }

const galleryImages = [
  { label: "Kurt Bet Special", image: "/images/kurt.jpg", color: "from-amber-900/60 to-amber-950/60" },
  { label: "Kitfo", image: "/images/kifo.jpg", color: "from-red-900/60 to-red-950/60" },
  { label: "Tibs", image: "/images/tibs.jpg", color: "from-stone-900/60 to-stone-950/60" },
  { label: "Gored Gored", image: "/images/gored gored.jpg", color: "from-amber-800/60 to-amber-950/60" },
  { label: "Awaze Tibs", image: "/images/Awaze Tibs.jpg", color: "from-emerald-900/60 to-emerald-950/60" },
  { label: "Zilzil Tibs", image: "/images/zilzil tibs.jpg", color: "from-yellow-900/60 to-yellow-950/60" },
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
  const { t } = useTranslation();
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

  const navLinks = [
    { href: "#home", label: t("landing.home") },
    { href: "#about", label: t("landing.about") },
    { href: "#menu", label: t("nav.menu") },
    { href: "#gallery", label: t("landing.gallery") },
    { href: "#contact", label: t("landing.contact") },
  ];
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
          <span className={`font-bold text-lg ${scrolled ? "text-[#3E2723]" : "text-white"}`}>{t("app.name")}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={`text-sm tracking-wider uppercase ${scrolledStyles} ${hoverStyles}`}>{l.label}</a>
          ))}
          <LanguageSwitcher light={!scrolled} />
          <a href="/dashboard" className="px-5 py-2.5 rounded-full bg-[#C89B3C] text-white text-sm font-semibold hover:bg-[#A12222] transition-all duration-300 shadow-lg hover:shadow-xl">
            {t("nav.dashboard")}
          </a>
          {isAuthenticated && (
            <a href="/orders" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-semibold hover:shadow-xl hover:shadow-[#C89B3C]/30 transition-all duration-300">
              {t("nav.myOrders")}
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
              {navLinks.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-[#3E2723] font-medium">{l.label}</a>
              ))}
              <a href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-[#3E2723] font-medium">{t("nav.dashboard")}</a>
              <div className="pt-1"><LanguageSwitcher /></div>
              {isAuthenticated && (
                <a href="/orders" onClick={() => setMenuOpen(false)} className="block text-center px-6 py-3 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold">
                  {t("nav.myOrders")}
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
  const { t } = useTranslation();
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

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white leading-tight mb-6">
          {t("landing.heroTitleFull")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto mb-8 lg:mb-10 leading-relaxed">
          {t("landing.heroTagline")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/menu" className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold text-lg hover:shadow-2xl hover:shadow-[#C89B3C]/40 transition-all duration-500 hover:scale-105">
            {t("hero.viewMenu")}
            <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/dashboard" className="group px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300">
            {t("hero.orderNow")}
          </a>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">{t("common.scroll")}</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureHighlights() {
  const { t } = useTranslation();
  const features = [
    { icon: UtensilsCrossed, title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: Coffee, title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: Leaf, title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
    { icon: Heart, title: t("landing.feature4Title"), desc: t("landing.feature4Desc") },
    { icon: Wine, title: t("landing.feature5Title"), desc: t("landing.feature5Desc") },
    { icon: Users, title: t("landing.feature6Title"), desc: t("landing.feature6Desc") },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label={t("landing.whyChooseUs")} title={t("landing.experienceTitle")} subtitle={t("landing.experienceSubtitle")} />
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
  const { t } = useTranslation();
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
                    <p className="text-[#C89B3C] text-2xl font-bold">{t("landing.generationsOf")}</p>
                    <p className="text-white text-4xl font-bold">{t("landing.excellenceTitle")}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#A12222] flex items-center justify-center shadow-xl">
                <p className="text-white text-center font-bold text-sm">
                  <span className="text-3xl">56+</span>
                  <br />{t("landing.yearsTradition")}
                </p>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">{t("landing.ourStory")}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 text-[#3E2723]">{t("landing.legacyTitle")}</h2>
            <div className="w-20 h-1 bg-[#C89B3C] mt-6 rounded-full" />
            <p className="text-lg text-[#3E2723]/70 mt-8 leading-relaxed">
              {t("landing.legacyDesc1")}
            </p>
            <p className="text-lg text-[#3E2723]/70 mt-4 leading-relaxed">
              {t("landing.legacyDesc2")}
            </p>
            <div className="grid grid-cols-3 gap-8 mt-10">
              {[
                { value: "56+", label: t("landing.yearsTradition"), color: "text-[#C89B3C]" },
                { value: "1K+", label: t("landing.happyGuests"), color: "text-[#A12222]" },
                { value: "100%", label: t("landing.freshDaily"), color: "text-green-600" },
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
  const { t } = useTranslation();
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
          <SectionTitle label={t("landing.signatureDishes")} title={t("landing.ourSpecialties")} subtitle={t("landing.specialtiesSubtitle")} />
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
                    {t("landing.bestseller")}
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
  const { t } = useTranslation();
  const steps = [
    { step: "01", title: t("landing.selectMeat"), desc: t("landing.selectMeatDesc") },
    { step: "02", title: t("landing.freshPrep"), desc: t("landing.freshPrepDesc") },
    { step: "03", title: t("landing.seasoning"), desc: t("landing.seasoningDesc") },
    { step: "04", title: t("landing.expertCutting"), desc: t("landing.expertCuttingDesc") },
    { step: "05", title: t("landing.serveFresh"), desc: t("landing.serveFreshDesc") },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#1B1B1B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 30% 50%, #C89B3C 0%, transparent 50%), radial-gradient(circle at 70% 80%, #A12222 0%, transparent 40%)`,
      }} />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">{t("landing.liveKitchen")}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 text-white">{t("landing.prepTitle")}</h2>
            <p className="text-lg text-white/60 mt-4 max-w-2xl mx-auto">{t("landing.prepSubtitle")}</p>
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
  const { t } = useTranslation();
  const whyChooseUs = [t("landing.whyItem1"), t("landing.whyItem2"), t("landing.whyItem3"), t("landing.whyItem4"), t("landing.whyItem5"), t("landing.whyItem6"), t("landing.whyItem7"), t("landing.whyItem8")];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label={t("landing.whyChooseUs")} title={t("landing.excellence")} />
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
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label={t("landing.gallery")} title={t("landing.ourWorld")} subtitle={t("landing.ourWorldDesc")} />
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
  const { t } = useTranslation();
  const testimonials = [
    { name: t("landing.testimonial1Name"), text: t("landing.testimonial1Text"), rating: 5 },
    { name: t("landing.testimonial2Name"), text: t("landing.testimonial2Text"), rating: 5 },
    { name: t("landing.testimonial3Name"), text: t("landing.testimonial3Text"), rating: 5 },
    { name: t("landing.testimonial4Name"), text: t("landing.testimonial4Text"), rating: 5 },
  ];
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
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">{t("landing.testimonials")}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 text-white">{t("landing.testimonialTitle")}</h2>
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
  const { t } = useTranslation();
  const cultureCards = [
    { title: t("landing.historyKurt"), desc: t("landing.historyKurtDesc") },
    { title: t("landing.tereSegaTradition"), desc: t("landing.tereSegaTraditionDesc") },
    { title: t("landing.hospitality"), desc: t("landing.hospitalityDesc") },
    { title: t("landing.coffeeCeremony"), desc: t("landing.coffeeCeremonyDesc") },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label={t("landing.ourHeritage")} title={t("landing.traditionTitle")} subtitle={t("landing.traditionSubtitle")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cultureCards.map((c, i) => (
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
  const { t } = useTranslation();
  const specialOffers = [
    { title: t("landing.offer1Title"), desc: t("landing.offer1Desc"), badge: t("landing.offer1Badge") },
    { title: t("landing.offer2Title"), desc: t("landing.offer2Desc"), badge: t("landing.offer2Badge") },
    { title: t("landing.offer3Title"), desc: t("landing.offer3Desc"), badge: t("landing.offer3Badge") },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-[#3E2723] to-[#1B1B1B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, #C89B3C 0%, transparent 60%)`,
      }} />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-[#C89B3C] font-medium">{t("landing.specialOffers")}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 text-white">{t("landing.exclusiveDeals")}</h2>
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
                  {t("landing.claimOffer")} <ArrowRight className="w-4 h-4" />
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
  const { t } = useTranslation();
  const locationItems = [
    { icon: MapPin, label: t("landing.addressLabel"), value: t("landing.address") },
    { icon: Clock, label: t("landing.openingHours"), value: t("landing.hours") },
    { icon: Phone, label: t("landing.phoneLabel"), value: t("landing.phone") },
  ];
  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#F8F4EE]">
      <div className="max-w-[1600px] mx-auto">
        <AnimatedSection>
          <SectionTitle label={t("landing.visitUs")} title={t("landing.findUs")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-[#3E2723] to-[#1B1B1B] flex items-center justify-center">
              <MapPin className="w-16 h-16 text-[#C89B3C]" />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              {locationItems.map(item => (
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
                <MapPin className="w-5 h-5" /> {t("landing.getDirections")}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function QRCodeSection() {
  const { t } = useTranslation();

  const features = [
    t("landing.qrFeature1"),
    t("landing.qrFeature2"),
    t("landing.qrFeature3"),
    t("landing.qrFeature4"),
    t("landing.qrFeature5"),
    t("landing.qrFeature6"),
    t("landing.qrFeature7"),
    t("landing.qrFeature8"),
    t("landing.qrFeature9"),
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-[#3E2723] via-[#1B1B1B] to-[#A12222] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#C89B3C] rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C89B3C]/40 rounded-full blur-[150px]" />
      </div>
      {/* Ethiopian Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, #C89B3C 0px, #C89B3C 2px, transparent 2px, transparent 8px)`,
      }} />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12 lg:mb-16">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-[#C89B3C]/30 mb-6"
            >
              <Smartphone className="w-4 h-4 text-[#C89B3C]" />
              <span className="text-xs tracking-[0.2em] uppercase text-[#C89B3C] font-medium">QR Code</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
              {t("landing.qrTitle")}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#C89B3C] to-[#A12222] mx-auto rounded-full mb-6" />
            <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              {t("landing.qrSubtitle")}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* QR Code */}
          <AnimatedSection>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-6 bg-[#C89B3C]/20 rounded-3xl blur-2xl group-hover:bg-[#C89B3C]/30 transition-all duration-500" />
                {/* Glass Card */}
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#C89B3C]/40 group-hover:border-[#C89B3C]/70 transition-all duration-500">
                  {/* Decorative Corners */}
                  <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-[#C89B3C] rounded-tl-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-[#C89B3C] rounded-tr-xl" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-[#C89B3C] rounded-bl-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-[#C89B3C] rounded-br-xl" />

                  <div className="p-2 sm:p-3 bg-white rounded-2xl">
                    <QRCodeSVG
                      value="https://kurt-bet.vercel.app/menu"
                      size={280}
                      level="H"
                      includeMargin
                      className="w-full h-auto max-w-[280px] mx-auto"
                    />
                  </div>

                  <p className="text-center text-xs text-[#3E2723]/60 mt-4 font-medium tracking-wider uppercase">
                    {t("app.name")}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Features & CTA */}
          <AnimatedSection delay={0.2}>
            <div className="space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#C89B3C]/30 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#C89B3C]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#C89B3C]" />
                    </div>
                    <span className="text-sm text-white/80">{feat}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/menu"
                  className="flex-1 px-8 py-4 rounded-full bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white font-semibold text-center shadow-lg hover:shadow-xl hover:shadow-[#C89B3C]/30 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t("landing.qrOpenMenu")}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/menu?category=specials"
                  className="flex-1 px-8 py-4 rounded-full border-2 border-[#C89B3C]/50 text-[#C89B3C] font-semibold text-center hover:bg-[#C89B3C]/10 transition-all duration-300"
                >
                  {t("landing.qrTodaySpecials")}
                </motion.a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  const footerLinks = [
    { href: "#home", label: t("landing.home") },
    { href: "#about", label: t("landing.about") },
    { href: "#menu", label: t("nav.menu") },
    { href: "#gallery", label: t("landing.gallery") },
    { href: "#contact", label: t("landing.contact") },
  ];
  return (
    <footer className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-[#1B1B1B] text-white/60">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A12222] to-[#C89B3C] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">{t("app.name")}</span>
            </div>
            <p className="text-sm leading-relaxed">{t("landing.footerDesc")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t("landing.quickLinks")}</h4>
            <div className="space-y-2 text-sm">
              {footerLinks.map(l => (
                <a key={l.href} href={l.href} className="block hover:text-[#C89B3C] transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t("landing.openingHours")}</h4>
            <div className="space-y-2 text-sm">
              <p>{t("common.mondaySunday")}</p>
              <p className="text-white font-semibold">{t("landing.hours")}</p>
              <p className="mt-4">{t("landing.coffeeCeremony")}</p>
              <p className="text-white font-semibold">{t("landing.coffeeCeremonyTime")}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t("landing.followUs")}</h4>
            <div className="flex gap-3 mb-6">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#C89B3C]/20 hover:text-[#C89B3C] transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <h4 className="font-semibold text-white mb-3">{t("landing.newsletter")}</h4>
            <div className="flex">
              <input type="email" placeholder={t("landing.newsletterPlaceholder")} className="flex-1 px-4 py-2.5 rounded-l-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C89B3C]" />
              <button className="px-4 py-2.5 rounded-r-xl bg-gradient-to-r from-[#C89B3C] to-[#A12222] text-white text-sm font-semibold">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>{t("landing.copyright")}</p>
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
      <QRCodeSection />
      <Footer />
    </div>
  );
}
