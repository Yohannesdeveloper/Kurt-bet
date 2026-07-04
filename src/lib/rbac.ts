import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export type UserRole = "ADMIN" | "BARTENDER" | "CLIENT" | "KITCHEN" | "WAITER";

export interface RouteAccess {
  roles: UserRole[];
  redirectTo?: string;
}

export const routeAccess: Record<string, RouteAccess> = {
  "/dashboard/admin": {
    roles: ["ADMIN"],
    redirectTo: "/dashboard",
  },
  "/dashboard/client": {
    roles: ["CLIENT"],
    redirectTo: "/dashboard",
  },
  "/dashboard/kitchen": {
    roles: ["KITCHEN"],
    redirectTo: "/dashboard",
  },
  "/dashboard/waiter": {
    roles: ["WAITER"],
    redirectTo: "/dashboard",
  },
  "/orders": {
    roles: ["ADMIN", "BARTENDER", "WAITER", "CLIENT"],
    redirectTo: "/dashboard",
  },
  "/kds": {
    roles: ["ADMIN", "KITCHEN"],
    redirectTo: "/dashboard",
  },
  "/tables": {
    roles: ["ADMIN", "WAITER"],
    redirectTo: "/dashboard",
  },
  "/menu": {
    roles: ["ADMIN", "BARTENDER", "CLIENT"],
    redirectTo: "/dashboard",
  },
  "/employees": {
    roles: ["ADMIN"],
    redirectTo: "/dashboard",
  },
  "/reports": {
    roles: ["ADMIN"],
    redirectTo: "/dashboard",
  },
  "/settings": {
    roles: ["ADMIN"],
    redirectTo: "/dashboard",
  },
  "/inventory": {
    roles: ["ADMIN"],
    redirectTo: "/dashboard",
  },
  "/payments": {
    roles: ["ADMIN", "WAITER"],
    redirectTo: "/dashboard",
  },
  "/reservations": {
    roles: ["ADMIN", "CLIENT"],
    redirectTo: "/dashboard",
  },
};

export async function requireRole(role: UserRole) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as UserRole;
  
  if (userRole !== role) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireAnyRole(roles: UserRole[]) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as UserRole;
  
  if (!roles.includes(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

export function checkRouteAccess(path: string, userRole: UserRole): boolean {
  const access = routeAccess[path];
  if (!access) return true;
  
  return access.roles.includes(userRole);
}

export function getRedirectForRole(role: UserRole): string {
  const redirects: Record<UserRole, string> = {
    ADMIN: "/dashboard/admin",
    BARTENDER: "/dashboard",
    CLIENT: "/dashboard/client",
    KITCHEN: "/dashboard/kitchen",
    WAITER: "/dashboard/waiter",
  };
  return redirects[role] || "/dashboard";
}
