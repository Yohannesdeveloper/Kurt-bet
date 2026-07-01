"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useSession, signOut } from "next-auth/react";
import { useState, memo, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";

// Dynamic icon imports for better code splitting
const LayoutDashboard = dynamic(() => import('lucide-react').then(mod => ({ default: mod.LayoutDashboard })), { ssr: false });
const ClipboardList = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ClipboardList })), { ssr: false });
const CookingPot = dynamic(() => import('lucide-react').then(mod => ({ default: mod.CookingPot })), { ssr: false });
const Store = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Store })), { ssr: false });
const UtensilsCrossed = dynamic(() => import('lucide-react').then(mod => ({ default: mod.UtensilsCrossed })), { ssr: false });
const CreditCard = dynamic(() => import('lucide-react').then(mod => ({ default: mod.CreditCard })), { ssr: false });
const LogOut = dynamic(() => import('lucide-react').then(mod => ({ default: mod.LogOut })), { ssr: false });
const Settings = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Settings })), { ssr: false });
const Users = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Users })), { ssr: false });
const BarChart3 = dynamic(() => import('lucide-react').then(mod => ({ default: mod.BarChart3 })), { ssr: false });
const Menu = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Menu })), { ssr: false });
const X = dynamic(() => import('lucide-react').then(mod => ({ default: mod.X })), { ssr: false });
const Sun = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Sun })), { ssr: false });
const Moon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Moon })), { ssr: false });
const Beef = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Beef })), { ssr: false });
const Send = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Send })), { ssr: false });

const navItemsByRole: Record<string, Array<{ href: string; label: string; icon: any }>> = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders", icon: ClipboardList },
    { href: "/kds", label: "Kitchen", icon: CookingPot },
    { href: "/tables", label: "Tables", icon: Store },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/butcher", label: "Butcher", icon: Beef },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
  CLIENT: [
    { href: "/dashboard/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/orders", label: "My Orders", icon: ClipboardList },
    { href: "/dashboard/butcher-shop", label: "Butcher Shop", icon: Beef },
    { href: "/reservations", label: "Reservations", icon: Store },
  ],
  BUTCHER: [
    { href: "/dashboard/butcher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/butcher?status=PENDING", label: "Pending Orders", icon: Beef },
    { href: "/kds", label: "Kitchen Display", icon: CookingPot },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  ],
  KITCHEN: [
    { href: "/dashboard/kitchen", label: "Dashboard", icon: LayoutDashboard },
    { href: "/kds", label: "Kitchen Display", icon: CookingPot },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  ],
  WAITER: [
    { href: "/dashboard/waiter", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders", icon: ClipboardList },
    { href: "/tables", label: "Tables", icon: Store },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/payments", label: "Payments", icon: CreditCard },
  ],
};

const NavItem = memo(({ item, pathname, onClick }: { 
  item: { href: string; label: string; icon: any }; 
  pathname: string; 
  onClick: () => void;
}) => {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const IconComponent = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
          isActive
              ? "bg-gradient-to-r from-[#C89B3C]/20 to-[#C89B3C]/5 text-[#C89B3C] shadow-sm"
              : "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground hover:shadow-sm"
      )}
    >
        {IconComponent && <IconComponent className={cn(
        "h-4 w-4 transition-colors",
        isActive ? "text-[#C89B3C]" : "group-hover:text-[#C89B3C]"
      )} />}
      <span className={isActive ? "text-[#C89B3C]" : ""}>{item.label}</span>
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C89B3C] animate-pulse" />
      )}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const navItems = useMemo(() => navItemsByRole[userRole] || navItemsByRole.CLIENT, [userRole]);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 bg-background/80 backdrop-blur-xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C89B3C] to-[#3E2723] shadow-lg shadow-[#C89B3C]/20">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <span className="text-sm font-bold tracking-tight">Restaurant OS</span>
            <p className="text-[10px] text-sidebar-foreground/60 font-medium hidden sm:block">Enterprise Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item: { href: string; label: string; icon: any }) => (
              <NavItem
                key={item.href}
                item={item}
                pathname={pathname}
                onClick={handleMobileClose}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C89B3C] to-[#3E2723]">
              <span className="text-xs font-bold text-white">
                {(session?.user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">{session?.user?.name || "User"}</p>
              <p className="text-[10px] text-sidebar-foreground/60 capitalize hidden sm:block">
                {userRole.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-[#A12222] hover:bg-[#A12222]/10 transition-colors"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <div className="fixed left-0 lg:left-64 right-0 top-0 z-30 flex h-16 items-center border-b bg-[#F8F4EE]/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 xl:px-10 pl-16 lg:pl-6 xl:pl-8">
        <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#C89B3C] animate-pulse" />
            <span className="text-sm font-medium text-[#3E2723]">
              {navItems.find((i: { href: string; label: string }) => pathname.startsWith(i.href))?.label || "Restaurant OS"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#3E2723]/60 hover:text-[#3E2723]"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}
