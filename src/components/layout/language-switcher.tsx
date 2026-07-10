"use client";

import { useTranslation, locales, localeNames } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher({ light }: { light?: boolean }) {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
          light
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-muted-foreground dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-white/10"
        }`}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{locale === "en" ? "EN" : "አማ"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                locale === l
                  ? "text-ethiopian-clay font-semibold bg-ethiopian-clay/10"
                  : "text-ethiopian-clay/70 hover:bg-gray-50"
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
