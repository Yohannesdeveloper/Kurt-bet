import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { ReduxProvider } from "@/lib/store/provider";
import { TranslationProvider, type Locale } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Kurt Bet - Premium Ethiopian Restaurant",
    template: "%s | Kurt Bet",
  },
  description: "Experience the finest Ethiopian cuisine at Kurt Bet. Fresh Tere Sega, Kitfo, Tibs, and traditional Ethiopian dishes prepared with generations of culinary expertise.",
  keywords: ["Ethiopian restaurant", "Kurt Bet", "Tere Sega", "Ethiopian food", "Kitfo", "Tibs", "Addis Ababa", "Ethiopian cuisine"],
  authors: [{ name: "Kurt Bet" }],
  creator: "Kurt Bet",
  publisher: "Kurt Bet",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Kurt Bet - Premium Ethiopian Restaurant",
    description: "Experience the finest Ethiopian cuisine at Kurt Bet.",
    siteName: "Kurt Bet",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F4EE' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1B1B' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const storedLocale = cookieStore.get("kurtbet-locale")?.value as Locale | undefined;
  const validLocales: Locale[] = ["en", "am"];
  const locale = storedLocale && validLocales.includes(storedLocale) ? storedLocale : "en";

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              <ReduxProvider>
                <TranslationProvider initialLocale={locale}>
                  {children}
                </TranslationProvider>
              </ReduxProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: "12px",
                    padding: "12px 16px",
                  },
                }}
              />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
