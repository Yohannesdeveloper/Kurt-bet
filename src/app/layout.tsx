import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { ReduxProvider } from "@/lib/store/provider";
import { TranslationProvider } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Restaurant OS - Enterprise Restaurant Management",
    template: "%s | Restaurant OS",
  },
  description: "Enterprise Restaurant Management System - Streamline your restaurant operations with our comprehensive POS and management solution",
  keywords: ["restaurant", "POS", "management", "food service", "hospitality", "orders", "inventory"],
  authors: [{ name: "Restaurant OS" }],
  creator: "Restaurant OS",
  publisher: "Restaurant OS",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Restaurant OS - Enterprise Restaurant Management",
    description: "Enterprise Restaurant Management System",
    siteName: "Restaurant OS",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              <ReduxProvider>
                <TranslationProvider>
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
