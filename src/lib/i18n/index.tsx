"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "am";
export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "am"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
};

import en from "./translations/en.json";
import am from "./translations/am.json";

const allTranslations: Record<Locale, any> = { en, am };

type TranslationContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const translate = useCallback((path: string, vars?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let value = allTranslations[locale];
    for (const key of keys) {
      if (value == null) return path;
      value = value[key];
    }
    let result = typeof value === "string" ? value : path;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  }, [locale]);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t: translate }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
