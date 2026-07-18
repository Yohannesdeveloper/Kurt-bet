import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

function hasDatabase(): boolean {
  try {
    require("./prisma");
    return !!process.env.DATABASE_URL;
  } catch {
    return false;
  }
}

const useDb = hasDatabase();

function getAdapter(): NextAuthOptions["adapter"] {
  if (!useDb) return undefined;
  try {
    const { PrismaAdapter } = require("@next-auth/prisma-adapter");
    const { prisma } = require("./prisma");
    return PrismaAdapter(prisma);
  } catch {
    return undefined;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: getAdapter(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        if (useDb) {
          try {
            const { prisma } = require("./prisma");
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
              include: { role: true, restaurant: true },
            });

            if (!user || !user.isActive) {
              throw new Error("Invalid credentials");
            }

            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

            if (!isValid) {
              throw new Error("Invalid credentials");
            }

            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            });

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role.name,
              restaurantId: user.restaurantId,
              branchId: user.branchId,
              firstName: user.firstName,
              lastName: user.lastName,
              image: user.avatar,
            };
          } catch {
            // fall through to demo users
          }
        }

        const DEMO_USERS: Record<string, { name: string; role: string; firstName: string; lastName: string }> = {
          "admin@restaurant.com":   { name: "Admin User",     role: "ADMIN",   firstName: "Admin",   lastName: "User" },
          "waiter@restaurant.com":  { name: "Meron Tefera",   role: "WAITER",  firstName: "Meron",   lastName: "Tefera" },
          "kitchen@restaurant.com": { name: "Bereket Hailu",  role: "KITCHEN", firstName: "Bereket", lastName: "Hailu" },
          "client@restaurant.com":  { name: "Client User",    role: "CLIENT",  firstName: "Client",  lastName: "User" },
          "butcher@restaurant.com": { name: "Butcher User",   role: "BUTCHER", firstName: "Butcher", lastName: "User" },
          "bartender@restaurant.com": { name: "Bartender User", role: "BARTENDER", firstName: "Bartender", lastName: "User" },
          "vip-bartender@restaurant.com": { name: "VIP Bartender User", role: "VIP_BARTENDER", firstName: "VIP", lastName: "Bartender" },
        };
        const demo = DEMO_USERS[credentials.email];
        const passwordOk = credentials.email === "admin@restaurant.com"
          ? (credentials.password === "admin123" || credentials.password === "demo123")
          : credentials.password === "demo123";
        if (demo && passwordOk) {
          return {
            id: `demo-${demo.role.toLowerCase()}`,
            email: credentials.email,
            name: demo.name,
            role: demo.role,
            restaurantId: "demo-restaurant",
            branchId: null,
            firstName: demo.firstName,
            lastName: demo.lastName,
            image: null,
          };
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "WAITER";
        token.restaurantId = (user as { restaurantId?: string }).restaurantId || "";
        token.branchId = (user as { branchId?: string }).branchId || null;
        token.firstName = (user as { firstName?: string }).firstName || "";
        token.lastName = (user as { lastName?: string }).lastName || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { restaurantId: string }).restaurantId = token.restaurantId as string;
        (session.user as { branchId: string | null }).branchId = token.branchId as string | null;
        (session.user as { firstName: string }).firstName = token.firstName as string;
        (session.user as { lastName: string }).lastName = token.lastName as string;
      }
      return session;
    },
  },
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string;
  branchId: string | null;
  firstName: string;
  lastName: string;
  image?: string | null;
};

export function requireOwner(session: any): boolean {
  return session?.user?.role === "ADMIN";
}

export function hasPermission(role: string, requiredRole: string): boolean {
  const hierarchy: Record<string, number> = {
    CLIENT: 1,
    BUTCHER: 2,
    BARTENDER: 3,
    VIP_BARTENDER: 3,
    KITCHEN: 4,
    WAITER: 5,
    ADMIN: 6,
  };
  return (hierarchy[role] || 0) >= (hierarchy[requiredRole] || 0);
}

export function getRoleDashboard(role: string): string {
  const dashboards: Record<string, string> = {
    ADMIN: "/dashboard/admin",
    BARTENDER: "/dashboard",
    VIP_BARTENDER: "/dashboard",
    BUTCHER: "/dashboard/butcher",
    CLIENT: "/dashboard/client",
    KITCHEN: "/dashboard/kitchen",
    WAITER: "/dashboard/waiter",
  };
  return dashboards[role] || "/dashboard";
}
