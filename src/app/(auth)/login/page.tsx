"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Eye, EyeOff, Loader2, Sparkles, Shield, Zap, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { EthiopianCornerSet, JebenaIcon } from "@/components/shared/ethiopian-patterns";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRoleDashboard = (role: string): string => {
    const dashboards: Record<string, string> = {
      ADMIN: "/dashboard/admin",
      CLIENT: "/dashboard/client",
      KITCHEN: "/dashboard/kitchen",
      WAITER: "/dashboard/waiter",
    };
    return dashboards[role] || "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, label: "Lightning Fast" },
    { icon: Shield, label: "Secure" },
    { icon: Sparkles, label: "Premium Experience" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ethiopian-cream via-white to-ethiopian-cream p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-ethiopian-cross pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-ethiopian-gold/10 to-transparent rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-ethiopian-gold to-ethiopian-coffee shadow-2xl shadow-ethiopian-gold/30 mb-6 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay opacity-25 blur-sm"
            />
            <UtensilsCrossed className="h-10 w-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2 text-ethiopian-coffee">
            {t("app.name")}
          </h1>
          <p className="text-ethiopian-coffee/60 text-lg">{t("app.tagline")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-ethiopian-gold/20 shadow-2xl shadow-ethiopian-coffee/10 backdrop-blur-xl bg-white/90 relative overflow-hidden">
            <EthiopianCornerSet />
            <div className="absolute inset-0 pattern-overlay pointer-events-none" />
            <CardHeader className="space-y-1 relative z-10">
              <CardTitle className="text-2xl">{t("auth.welcomeBack")}</CardTitle>
              <CardDescription className="text-base">Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-ethiopian-coffee">{t("auth.email")}</label>
                  <Input
                    type="email"
                    placeholder="name@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 text-base border-ethiopian-gold/20 focus:border-ethiopian-gold focus:ring-ethiopian-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-ethiopian-coffee">{t("auth.password")}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="......"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-12 pr-12 text-base border-ethiopian-gold/20 focus:border-ethiopian-gold focus:ring-ethiopian-gold/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ethiopian-coffee/50 hover:text-ethiopian-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("auth.signIn")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 text-sm text-ethiopian-coffee/60"
            >
              <feature.icon className="h-4 w-4 text-ethiopian-gold" />
              <span>{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-xs text-ethiopian-coffee/40 mt-6"
        >
          Habesha Kurt Bet v1.0 &mdash; {t("landing.excellence")}
        </motion.p>
      </motion.div>
    </div>
  );
}
