"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  if (isMainDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <Sidebar />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
