"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/lib/i18n";
import { QRCodeSVG } from "qrcode.react";
import { SectionHeader, EthiopianCard, GoldButton, PatternDivider, LoadingSpinner } from "@/components/shared/section-header";
import { EthiopianCornerSet, JebenaIcon, MesobIcon, SpiceIcon, InjeraIcon } from "@/components/shared/ethiopian-patterns";
import {
  UtensilsCrossed, Coffee, Leaf, Heart, Wine, Users,
  ChevronDown, Star, MapPin, Clock, Phone, ArrowRight,
  Check, Menu, X, Quote, Play, Instagram, Facebook,
  ChevronLeft, ChevronRight, ExternalLink, Smartphone,
  Sparkles, Flame, Gem, Award, Shield,
} from "lucide-react";

interface MenuDish { id: string; name: string; description: string; price: number; image?: string; isAvailable: boolean; }

const galleryImages = [
  { label: "Kurt Bet Special", image: "/images/kurt.jpg", color: "from-ethiopian-coffee/80 to-ethiopian-charcoal/80" },
  { label: "Kitfo", image: "/images/kifo.jpg", color: "from-ethiopian-burgundy/80 to-ethiopian-charcoal/80" },
  { label: "Tibs", image: "/images/tibs.jpg", color: "from-ethiopian-earth/80 to-ethiopian-charcoal/80" },
  { label: "Gored Gored", image: "/images/gored gored.jpg", color: "from-ethiopian-gold/50 to-ethiopian-charcoal/80" },
  { label: "Awaze Tibs", image: "/images/Awaze Tibs.jpg", color: "from-ethiopian-olive/60 to-ethiopian-charcoal/80" },
  { label: "Zilzil Tibs", image: "/images/zilzil tibs.jpg", color: "from-ethiopian-gold/40 to-ethiopian-charcoal/80" },
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ethiopian-cream/95 backdrop-blur-xl shadow-lg shadow-ethiopian-charcoal/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 flex items-center justify-between">
        <motion.a href="#home" whileHover={{ scale: 1.02 }} className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-ethiopian-clay via-ethiopian-clay to-ethiopian-gold flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-25 blur-sm"
            />
          </div>
          <span className={`font-bold text-base sm:text-lg ${scrolled ? "text-ethiopian-coffee" : "text-white"}`}>{t("app.name")}</span>
        </motion.a>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(l => {
            const isActive = typeof window !== "undefined" && window.location.hash === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                className={`text-xs lg:text-sm tracking-wider uppercase font-medium transition-all duration-300 relative group ${
                  scrolled ? "text-ethiopian-coffee/70 hover:text-ethiopian-gold" : "text-white/80 hover:text-white"
                }`}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ethiopian-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            );
          })}
          <LanguageSwitcher light={!scrolled} />
          <GoldButton href="/dashboard">
            {t("nav.dashboard")}
          </GoldButton>
          {isAuthenticated && (
            <GoldButton href="/orders" variant="outline">
              {t("nav.myOrders")}
            </GoldButton>
          )}
        </div>

        <button className="md:hidden relative z-50" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`w-6 h-6 flex items-center justify-center transition-colors ${scrolled ? "text-ethiopian-coffee" : "text-ethiopian-gold"}`}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-ethiopian-cream/95 backdrop-blur-xl border-t border-ethiopian-gold/10 overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-ethiopian-coffee font-medium hover:text-ethiopian-gold transition-colors border-b border-ethiopian-gold/10 pb-3"
                >
                  {l.label}
                </a>
              ))}
              <a href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-ethiopian-coffee font-medium hover:text-ethiopian-gold transition-colors border-b border-ethiopian-gold/10 pb-3">
                {t("nav.dashboard")}
              </a>
              <div className="pt-2"><LanguageSwitcher /></div>
              {isAuthenticated && (
                <a href="/orders" onClick={() => setMenuOpen(false)} className="block text-center px-6 py-3 rounded-full bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white font-semibold shadow-lg">
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
  const { scrollYProgress } = useScroll();
  const heroBgY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.1]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ethiopian-charcoal">
      <motion.div style={{ y: heroBgY }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ethiopian-coffee/95 via-ethiopian-charcoal/98 to-ethiopian-burgundy/90 z-10" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, #C89B3C 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, #A12222 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, #3E2723 0%, transparent 50%)`,
          }}
        />
      </motion.div>

      {/* Ethiopian Cross Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.04] bg-ethiopian-cross z-10" />
      <div className="absolute inset-0 opacity-[0.02] bg-mesob-weave z-10" />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          className="absolute w-1 h-1 bg-ethiopian-gold rounded-full blur-[1px] z-10"
          style={{ left: `${10 + Math.random() * 80}%`, top: `${20 + Math.random() * 60}%` }}
        />
      ))}

      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto w-full">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white leading-tight mb-4 sm:mb-6"
          >
            {t("landing.heroTitleFull")}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-ethiopian-gold via-yellow-300 to-ethiopian-gold mx-auto mb-4 sm:mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/70 max-w-2xl sm:max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-light"
          >
            {t("landing.heroTagline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <GoldButton href="/menu">
              {t("hero.viewMenu")}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </GoldButton>
            <GoldButton href="/dashboard" variant="outline" className="bg-white/5 backdrop-blur-sm border-white/30 text-white hover:bg-white/10">
              {t("hero.orderNow")}
            </GoldButton>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium">{t("common.scroll")}</span>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ethiopian-cream to-transparent z-10" />
    </section>
  );
}

function FeatureHighlights() {
  const { t } = useTranslation();
  const features = [
    { icon: UtensilsCrossed, title: t("landing.feature1Title"), desc: t("landing.feature1Desc"), color: "from-ethiopian-gold/20 to-ethiopian-clay/20" },
    { icon: Coffee, title: t("landing.feature2Title"), desc: t("landing.feature2Desc"), color: "from-ethiopian-coffee/20 to-ethiopian-gold/20" },
    { icon: Leaf, title: t("landing.feature3Title"), desc: t("landing.feature3Desc"), color: "from-ethiopian-olive/20 to-ethiopian-gold/20" },
    { icon: Heart, title: t("landing.feature4Title"), desc: t("landing.feature4Desc"), color: "from-ethiopian-clay/20 to-ethiopian-burgundy/20" },
    { icon: Wine, title: t("landing.feature5Title"), desc: t("landing.feature5Desc"), color: "from-ethiopian-burgundy/20 to-ethiopian-gold/20" },
    { icon: Users, title: t("landing.feature6Title"), desc: t("landing.feature6Desc"), color: "from-ethiopian-gold/15 to-ethiopian-coffee/20" },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-cream texture-linen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-ethiopian-cross pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.whyChooseUs")} title={t("landing.experienceTitle")} subtitle={t("landing.experienceSubtitle")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-ethiopian-gold/20 overflow-hidden"
              >
                <div className="absolute inset-0 pattern-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative z-10`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-7 h-7 text-ethiopian-clay" />
                  </div>
                  <h3 className="text-xl font-bold text-ethiopian-coffee mb-2 font-serif">{f.title}</h3>
                  <p className="text-ethiopian-coffee/70 leading-relaxed text-sm">{f.desc}</p>
                </div>
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
    <section id="about" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] bg-tire-pattern pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <AnimatedSection>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-clay overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 opacity-[0.08] bg-ethiopian-cross" />
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-center p-8 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                    >
                      <InjeraIcon className="w-20 h-20 text-ethiopian-gold mx-auto mb-6" />
                    </motion.div>
                    <p className="text-ethiopian-gold/80 text-lg sm:text-xl font-medium mb-2 tracking-wider uppercase">{t("landing.generationsOf")}</p>
                    <p className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold">{t("landing.excellenceTitle")}</p>
                    <div className="w-16 h-0.5 bg-ethiopian-gold mx-auto mt-4" />
                  </div>
                </motion.div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay flex items-center justify-center shadow-2xl border-2 border-white/20"
              >
                <div className="text-white text-center">
                  <span className="text-2xl sm:text-3xl font-bold font-serif">56+</span>
                  <br />
                  <span className="text-[10px] sm:text-xs opacity-90 tracking-wider uppercase">{t("landing.yearsTradition")}</span>
                </div>
              </motion.div>
              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-ethiopian-gold/30 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-ethiopian-gold/30 rounded-tr-lg" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative pl-4 sm:pl-0">
              <span className="inline-block text-xs sm:text-sm tracking-[0.25em] uppercase text-ethiopian-gold font-medium mb-3 px-4 py-1.5 rounded-full bg-ethiopian-gold/10 border border-ethiopian-gold/20">
                {t("landing.ourStory")}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ethiopian-coffee mt-4 leading-tight">
                {t("landing.legacyTitle")}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay mt-6 rounded-full" />
              <p className="text-base sm:text-lg text-ethiopian-coffee/75 mt-6 sm:mt-8 leading-relaxed">
                {t("landing.legacyDesc1")}
              </p>
              <p className="text-base sm:text-lg text-ethiopian-coffee/75 mt-4 leading-relaxed">
                {t("landing.legacyDesc2")}
              </p>
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-10 p-6 rounded-2xl bg-ethiopian-cream/50 border border-ethiopian-gold/10">
                {[
                  { value: "56+", label: t("landing.yearsTradition"), color: "text-ethiopian-gold" },
                  { value: "1K+", label: t("landing.happyGuests"), color: "text-ethiopian-clay" },
                  { value: "100%", label: t("landing.freshDaily"), color: "text-ethiopian-olive" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${s.color}`}>{s.value}</p>
                    <p className="text-xs sm:text-sm text-ethiopian-coffee/60 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
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
    <section id="menu" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-cream texture-linen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-mesob-weave pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.signatureDishes")} title={t("landing.ourSpecialties")} subtitle={t("landing.specialtiesSubtitle")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {dishes.map((dish, i) => (
            <AnimatedSection key={dish.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-ethiopian-gold/20"
              >
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-ethiopian-coffee to-ethiopian-charcoal">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UtensilsCrossed className="w-12 h-12 text-ethiopian-gold/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white text-xs font-bold shadow-lg border border-white/20"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t("landing.bestseller")}
                    </span>
                  </motion.div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-ethiopian-coffee font-serif">{dish.name}</h3>
                    <span className="text-lg sm:text-xl font-bold text-ethiopian-gold">{dish.price} {t("common.currency")}</span>
                  </div>
                  <p className="text-ethiopian-coffee/70 text-sm leading-relaxed line-clamp-2">{dish.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = "/menu"}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-ethiopian-gold/10 to-ethiopian-clay/10 text-ethiopian-coffee font-medium text-sm hover:from-ethiopian-gold hover:to-ethiopian-clay hover:text-white transition-all duration-300 border border-ethiopian-gold/20"
                  >
                    {t("hero.orderNow")}
                  </motion.button>
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
  const steps: { step: string; title: string; desc: string; icon: React.ElementType }[] = [
    { step: "01", title: t("landing.selectMeat"), desc: t("landing.selectMeatDesc"), icon: UtensilsCrossed },
    { step: "02", title: t("landing.freshPrep"), desc: t("landing.freshPrepDesc"), icon: Coffee },
    { step: "03", title: t("landing.seasoning"), desc: t("landing.seasoningDesc"), icon: SpiceIcon as React.ElementType },
    { step: "04", title: t("landing.expertCutting"), desc: t("landing.expertCuttingDesc"), icon: MesobIcon as React.ElementType },
    { step: "05", title: t("landing.serveFresh"), desc: t("landing.serveFreshDesc"), icon: InjeraIcon as React.ElementType },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-charcoal relative overflow-hidden">
      <div className="absolute inset-0 texture-wood opacity-50" />
      <div className="absolute inset-0 opacity-[0.05] bg-ethiopian-cross" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-ethiopian-gold/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-ethiopian-clay/5 rounded-full blur-3xl"
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader
            label={t("landing.liveKitchen")}
            title={t("landing.prepTitle")}
            subtitle={t("landing.prepSubtitle")}
            light
          />
        </AnimatedSection>
        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ethiopian-gold via-ethiopian-clay to-transparent hidden md:block" />
          <div className="space-y-8 sm:space-y-12">
            {steps.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.15}>
                <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-10">
                  <div className="hidden md:flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay text-white font-bold text-lg sm:text-xl relative z-10 shadow-xl shadow-ethiopian-gold/20 flex-shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <s.icon className="w-7 h-7" />
                    </motion.div>
                  </div>
                  <div className="flex-1 bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border border-white/[0.06] hover:border-ethiopian-gold/20 transition-all duration-500 group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-ethiopian-gold/40 text-sm font-mono">{s.step}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-ethiopian-gold/20 to-transparent" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-serif">{s.title}</h3>
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed">{s.desc}</p>
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
  const icons = [Gem, Award, Shield, Heart, Star, Flame, Coffee, Leaf];
  const whyChooseUs = [t("landing.whyItem1"), t("landing.whyItem2"), t("landing.whyItem3"), t("landing.whyItem4"), t("landing.whyItem5"), t("landing.whyItem6"), t("landing.whyItem7"), t("landing.whyItem8")];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] bg-tire-pattern pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.whyChooseUs")} title={t("landing.excellence")} />
        </AnimatedSection>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {whyChooseUs.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <AnimatedSection key={item} delay={i * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="p-4 sm:p-6 rounded-2xl bg-ethiopian-cream/70 border border-ethiopian-gold/10 hover:border-ethiopian-gold/30 transition-all duration-300 text-center group gold-glow"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <Icon className="w-5 h-5 text-ethiopian-gold" />
                  </motion.div>
                  <p className="font-semibold text-ethiopian-coffee text-sm sm:text-base">{item}</p>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-cream texture-linen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-ethiopian-cross pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.gallery")} title={t("landing.ourWorld")} subtitle={t("landing.ourWorldDesc")} />
        </AnimatedSection>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 lg:gap-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              onClick={() => setSelected(i)}
            >
              <img src={img.image} alt={img.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className={`absolute inset-0 bg-gradient-to-br ${img.color} mix-blend-overlay`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-sm">
                <div className="p-3 rounded-full bg-ethiopian-gold/20 backdrop-blur-sm border border-white/30">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium border border-white/10">
                  {img.label}
                </span>
              </div>
              {/* Decorative corner */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ethiopian-charcoal/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="max-w-4xl w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-ethiopian-gold/20" onClick={e => e.stopPropagation()}>
              <img src={galleryImages[selected].image} alt={galleryImages[selected].label} className="w-full h-full object-cover" />
            </motion.div>
            <button className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all" onClick={() => setSelected(null)}>
              <X className="w-5 h-5" />
            </button>
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
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-charcoal relative overflow-hidden">
      <div className="absolute inset-0 texture-wood" />
      <div className="absolute inset-0 opacity-[0.05] bg-mesob-weave" />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-ethiopian-gold/5 rounded-full blur-3xl"
      />

      <div className="max-w-4xl lg:max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader
            label={t("landing.testimonials")}
            title={t("landing.testimonialTitle")}
            light
          />
        </AnimatedSection>
        <AnimatedSection>
          <div className="relative">
            <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-ethiopian-gold/10 absolute -top-2 sm:-top-4 -left-2 sm:-left-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center py-6 sm:py-8 px-2 sm:px-4"
              >
                <p className="text-xl sm:text-2xl md:text-3xl text-white/85 italic leading-relaxed mb-6 sm:mb-8 font-light tracking-wide">
                  &ldquo;{testimonials[idx].text}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {Array.from({ length: testimonials[idx].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-ethiopian-gold text-ethiopian-gold" />
                  ))}
                </div>
                <p className="text-white font-semibold text-base sm:text-lg">{testimonials[idx].name}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`rounded-full transition-all duration-500 ${
                    i === idx
                      ? "bg-ethiopian-gold w-6 sm:w-8 h-2 sm:h-2.5"
                      : "bg-white/20 w-2 sm:w-2.5 h-2 sm:h-2.5 hover:bg-white/40"
                  }`}
                />
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
    { title: t("landing.historyKurt"), desc: t("landing.historyKurtDesc"), icon: InjeraIcon, color: "from-ethiopian-gold/10 to-ethiopian-clay/5" },
    { title: t("landing.tereSegaTradition"), desc: t("landing.tereSegaTraditionDesc"), icon: MesobIcon, color: "from-ethiopian-coffee/10 to-ethiopian-gold/5" },
    { title: t("landing.hospitality"), desc: t("landing.hospitalityDesc"), icon: JebenaIcon, color: "from-ethiopian-clay/10 to-ethiopian-burgundy/5" },
    { title: t("landing.coffeeCeremony"), desc: t("landing.coffeeCeremonyDesc"), icon: SpiceIcon, color: "from-ethiopian-olive/10 to-ethiopian-gold/5" },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] bg-tire-pattern pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.ourHeritage")} title={t("landing.traditionTitle")} subtitle={t("landing.traditionSubtitle")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cultureCards.map((c, i) => (
            <AnimatedSection key={c.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-ethiopian-cream/80 to-white border border-ethiopian-gold/10 hover:border-ethiopian-gold/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 pattern-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-ethiopian-gold via-ethiopian-clay to-ethiopian-gold rounded-l-lg" />
                <div className="relative z-10 flex gap-4 sm:gap-5">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 flex items-center justify-center flex-shrink-0"
                  >
                    <c.icon className="w-6 h-6 sm:w-7 sm:h-7 text-ethiopian-gold" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-ethiopian-coffee mb-2 font-serif">{c.title}</h3>
                    <p className="text-ethiopian-coffee/70 text-sm sm:text-base leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
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
    { title: t("landing.offer1Title"), desc: t("landing.offer1Desc"), badge: t("landing.offer1Badge"), icon: Flame },
    { title: t("landing.offer2Title"), desc: t("landing.offer2Desc"), badge: t("landing.offer2Badge"), icon: Coffee },
    { title: t("landing.offer3Title"), desc: t("landing.offer3Desc"), badge: t("landing.offer3Badge"), icon: Star },
  ];
  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-burgundy relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] bg-ethiopian-cross" />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ethiopian-gold/5 rounded-full blur-3xl"
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader
            label={t("landing.specialOffers")}
            title={t("landing.exclusiveDeals")}
            light
          />
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {specialOffers.map((offer, i) => {
            const Icon = offer.icon;
            return (
              <AnimatedSection key={offer.title} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group p-6 sm:p-8 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-ethiopian-gold/30 transition-all duration-300 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 flex items-center justify-center mx-auto mb-4 sm:mb-5"
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-ethiopian-gold" />
                  </motion.div>
                  <span className="inline-block px-3 py-1 rounded-full bg-ethiopian-gold/15 text-ethiopian-gold text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 tracking-wider uppercase border border-ethiopian-gold/20">
                    {offer.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-serif">{offer.title}</h3>
                  <p className="text-white/50 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">{offer.desc}</p>
                  <a href="/menu" className="inline-flex items-center gap-2 text-ethiopian-gold font-semibold text-sm group-hover:gap-3 transition-all">
                    {t("landing.claimOffer")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              </AnimatedSection>
            );
          })}
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
    <section id="contact" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-cream texture-linen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-ethiopian-cross pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <SectionHeader label={t("landing.visitUs")} title={t("landing.findUs")} />
        </AnimatedSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <AnimatedSection>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-clay flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-[0.08] bg-ethiopian-cross" />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <MapPin className="w-16 h-16 sm:w-20 sm:h-20 text-ethiopian-gold/60" />
                </motion.div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-ethiopian-gold to-ethiopian-clay flex items-center justify-center shadow-xl border-2 border-white/20">
                <div className="text-white text-center">
                  <p className="text-lg sm:text-xl font-bold font-serif">56+</p>
                  <p className="text-[8px] sm:text-[10px] opacity-80">{t("landing.yearsTradition")}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="space-y-5 sm:space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-ethiopian-gold/10">
              {locationItems.map(item => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-ethiopian-gold/15 to-ethiopian-clay/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ethiopian-gold" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-ethiopian-coffee/50 tracking-wider uppercase">{item.label}</p>
                    <p className="text-base sm:text-lg font-semibold text-ethiopian-coffee">{item.value}</p>
                  </div>
                </div>
              ))}
              <GoldButton href="/menu">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("landing.getDirections")}
              </GoldButton>
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
    t("landing.qrFeature1"), t("landing.qrFeature2"), t("landing.qrFeature3"),
    t("landing.qrFeature4"), t("landing.qrFeature5"), t("landing.qrFeature6"),
    t("landing.qrFeature7"), t("landing.qrFeature8"), t("landing.qrFeature9"),
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-ethiopian-coffee via-ethiopian-charcoal to-ethiopian-burgundy relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] bg-ethiopian-cross" />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-10 left-10 w-72 h-72 bg-ethiopian-gold/5 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-ethiopian-clay/5 rounded-full blur-[150px]"
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12 lg:mb-16">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-ethiopian-gold/20 mb-6"
            >
              <Smartphone className="w-4 h-4 text-ethiopian-gold" />
              <span className="text-xs tracking-[0.2em] uppercase text-ethiopian-gold font-medium">QR Code</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white mb-4">
              {t("landing.qrTitle")}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay mx-auto rounded-full mb-6" />
            <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              {t("landing.qrSubtitle")}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          <AnimatedSection>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <div className="relative group">
                <div className="absolute -inset-6 bg-ethiopian-gold/10 rounded-3xl blur-2xl group-hover:bg-ethiopian-gold/20 transition-all duration-500" />
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-ethiopian-gold/30 group-hover:border-ethiopian-gold/60 transition-all duration-500">
                  <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-ethiopian-gold rounded-tl-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-ethiopian-gold rounded-tr-xl" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-ethiopian-gold rounded-bl-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-ethiopian-gold rounded-br-xl" />
                  <div className="p-2 sm:p-3 bg-white rounded-2xl">
                    <QRCodeSVG
                      value="https://habesha-kurt-bet.vercel.app/menu"
                      size={280}
                      level="H"
                      includeMargin
                      className="w-full h-auto max-w-[280px] mx-auto"
                    />
                  </div>
                  <p className="text-center text-xs text-ethiopian-coffee/60 mt-4 font-medium tracking-wider uppercase">
                    {t("app.name")}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-ethiopian-gold/20 hover:bg-white/[0.08] transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-ethiopian-gold/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-ethiopian-gold" />
                    </div>
                    <span className="text-sm text-white/75">{feat}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <GoldButton href="/menu">
                  {t("landing.qrOpenMenu")}
                  <ArrowRight className="w-4 h-4" />
                </GoldButton>
                <GoldButton href="/menu?category=specials" variant="outline">
                  {t("landing.qrTodaySpecials")}
                </GoldButton>
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
    <footer className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-ethiopian-charcoal text-white/60 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-ethiopian-cross pointer-events-none" />
      <div className="absolute inset-0 texture-wood opacity-30" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ethiopian-clay to-ethiopian-gold flex items-center justify-center shadow-lg">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-25 blur-sm"
                />
              </div>
              <span className="font-bold text-lg text-white">{t("app.name")}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">{t("landing.footerDesc")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 font-serif">{t("landing.quickLinks")}</h4>
            <div className="space-y-2.5 text-sm">
              {footerLinks.map(l => (
                <a key={l.href} href={l.href} className="block hover:text-ethiopian-gold transition-all duration-300 hover:translate-x-1">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 font-serif">{t("landing.openingHours")}</h4>
            <div className="space-y-2 text-sm">
              <p className="text-white/50">{t("common.mondaySunday")}</p>
              <p className="text-white font-semibold">{t("landing.hours")}</p>
              <p className="mt-4 text-white/50">{t("landing.coffeeCeremony")}</p>
              <p className="text-white font-semibold">{t("landing.coffeeCeremonyTime")}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 font-serif">{t("landing.followUs")}</h4>
            <div className="flex gap-3 mb-6">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-ethiopian-gold/15 hover:text-ethiopian-gold hover:border-ethiopian-gold/30 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <h4 className="font-semibold text-white mb-3 font-serif">{t("landing.newsletter")}</h4>
            <div className="flex">
              <input
                type="email"
                placeholder={t("landing.newsletterPlaceholder")}
                className="flex-1 px-4 py-2.5 rounded-l-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-ethiopian-gold/50 transition-colors"
              />
              <button className="px-4 py-2.5 rounded-r-xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white text-sm font-semibold hover:shadow-lg hover:shadow-ethiopian-gold/20 transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="ethiopian-divider my-8" />
        <div className="pt-6 text-center text-sm text-white/40">
          <p>{t("landing.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const { status } = useSession();
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-ethiopian-charcoal">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-ethiopian-gold/20 border-t-ethiopian-gold rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-2 border-ethiopian-clay/20 border-b-ethiopian-clay rounded-full"
        />
      </div>
    </div>
  );
  return (
    <div className="bg-ethiopian-cream">
      <FloatingNav />
      <HeroSection />
      <FeatureHighlights />
      <PatternDivider />
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
