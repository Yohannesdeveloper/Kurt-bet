"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { EthiopianCornerSet } from "./ethiopian-patterns";

export function SectionHeader({
  label,
  title,
  subtitle,
  light = false,
  center = true,
  goldAccent = true,
}: {
  label: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
  goldAccent?: boolean;
}) {
  const textColor = light ? "text-white" : "text-ethiopian-coffee dark:text-ethiopian-cream";
  const mutedColor = light ? "text-white/70" : "text-ethiopian-coffee/70 dark:text-ethiopian-cream/70";
  const labelColor = light ? "text-ethiopian-gold" : "text-ethiopian-gold";

  return (
    <div className={`${center ? "text-center" : ""} mb-12 sm:mb-16 lg:mb-20`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`inline-block text-xs sm:text-sm tracking-[0.25em] uppercase ${labelColor} font-medium mb-3 relative`}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-ethiopian-gold/10 dark:bg-ethiopian-gold/20 border border-ethiopian-gold/20 dark:border-ethiopian-gold/30 shadow-sm">
          {label}
        </span>
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold ${textColor} leading-tight ${center ? "mx-auto max-w-4xl" : ""}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`text-base sm:text-lg ${mutedColor} mt-4 sm:mt-6 max-w-2xl ${center ? "mx-auto" : ""} leading-relaxed`}
        >
          {subtitle}
        </motion.p>
      )}
      {goldAccent && (
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`h-0.5 bg-gradient-to-r from-ethiopian-gold via-ethiopian-clay to-ethiopian-gold rounded-full mt-6 ${center ? "mx-auto" : ""}`}
        />
      )}
    </div>
  );
}

export function EthiopianCard({
  children,
  className = "",
  hover = true,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden ${
        glow ? "gold-glow" : "shadow-lg"
      } ${
        hover ? "hover:shadow-2xl hover:-translate-y-1 transition-all duration-500" : ""
      } ${className}`}
    >
      <EthiopianCornerSet />
      <div className="absolute inset-0 pointer-events-none pattern-overlay" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function GoldButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void | Promise<void>;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
}) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 overflow-hidden group";
  const variants = {
    primary: "bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white shadow-lg shadow-ethiopian-gold/20 hover:shadow-xl hover:shadow-ethiopian-gold/30 hover:scale-105 active:scale-95",
    outline: "border-2 border-ethiopian-gold/40 text-ethiopian-gold hover:bg-ethiopian-gold/10 hover:border-ethiopian-gold/60 active:scale-95",
    ghost: "text-ethiopian-gold hover:bg-ethiopian-gold/10 active:scale-95",
  };

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {content}
    </motion.button>
  );
}

export function PatternDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative py-8 ${className}`}>
      <div className="ethiopian-divider" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-ethiopian-cream dark:bg-black border-2 border-ethiopian-gold/20 flex items-center justify-center">
        <div className="w-2 h-2 bg-ethiopian-gold rounded-full" />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ethiopian-cream dark:bg-black texture-linen">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-2 border-ethiopian-gold/20 border-t-ethiopian-gold rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-2 border-ethiopian-clay/20 border-b-ethiopian-clay rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-5 bg-ethiopian-gold/10 rounded-full"
        />
      </div>
    </div>
  );
}
