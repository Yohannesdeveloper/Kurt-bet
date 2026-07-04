import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON } from "@/lib/demo-storage";

const BUTCHER_KEYWORDS = ["tibs", "kurt", "kitfo", "dulet", "tere sega", "tere siga", "gored gored", "awaze tibs", "zilzil tibs", "shekla tibs", "lamb tibs"];
const DRINK_KEYWORDS = ["coffee", "macchiato", "tej", "tella", "tea", "spris", "juice", "ambo", "soft drink", "besso", "atmet", "halwa", "cheesecake", "atayef", "water", "soda", "beer", "wine", "cocktail", "espresso", "latte", "cappuccino", "mocha", "smoothie", "shake"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const role = searchParams.get("role")?.toLowerCase();
    const days = parseInt(searchParams.get("days") || "30");

    if (!role || !["butcher", "bartender", "waiter"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role. Use: butcher, bartender, waiter" }, { status: 400 });
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const result = await fetchCashflowByRole(role, restaurantId, dateFrom);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Cashflow report error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function fetchCashflowByRole(role: string, restaurantId: string, dateFrom: Date) {
  switch (role) {
    case "waiter":
      return fetchWaiterCashflow(restaurantId, dateFrom);
    case "butcher":
      return fetchButcherCashflow(restaurantId, dateFrom);
    case "bartender":
      return fetchBartenderCashflow(restaurantId, dateFrom);
    default:
      return { data: [], summary: { totalRevenue: 0, totalTransactions: 0, totalTips: 0 } };
  }
}

async function fetchWaiterCashflow(restaurantId: string, dateFrom: Date) {
  try {
    const waiters = await prisma.user.findMany({
      where: { restaurantId, role: { name: "WAITER" }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    const waiterIds = waiters.map((w) => w.id);

    const [orders, payments] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId,
          waiterId: { in: waiterIds },
          createdAt: { gte: dateFrom },
          status: { not: "CANCELLED" },
        },
        include: {
          waiter: { select: { firstName: true, lastName: true } },
          table: { select: { number: true } },
          items: { select: { name: true, quantity: true, totalPrice: true, unitPrice: true } },
          payments: { select: { amount: true, tipAmount: true, method: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.payment.findMany({
        where: {
          restaurantId,
          processedById: { in: waiterIds },
          createdAt: { gte: dateFrom },
        },
        include: {
          processedBy: { select: { firstName: true, lastName: true } },
          order: { select: { orderNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalTips = payments.reduce((sum, p) => sum + p.tipAmount, 0);
    const totalTransactions = orders.length;

    const employees = waiters.map((w) => ({
      id: w.id,
      name: `${w.firstName} ${w.lastName}`,
      orderCount: orders.filter((o) => o.waiterId === w.id).length,
      revenue: orders.filter((o) => o.waiterId === w.id).reduce((s, o) => s + o.total, 0),
    }));

    return {
      data: { orders, payments, employees },
      summary: { totalRevenue, totalTransactions, totalTips },
    };
  } catch {
    const [demoOrders] = await Promise.all([
      readDemoJSON<any>(".demo-orders.json"),
    ]);
    const waiterOrders = demoOrders.filter((o: any) => {
      const created = new Date(o.createdAt);
      return o.status !== "CANCELLED" && created >= dateFrom;
    });
    const totalRevenue = waiterOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    return {
      data: { orders: waiterOrders, payments: [], employees: [{ id: "demo", name: "Wait Staff", orderCount: waiterOrders.length, revenue: totalRevenue }] },
      summary: { totalRevenue, totalTransactions: waiterOrders.length, totalTips: 0 },
    };
  }
}

async function fetchButcherCashflow(restaurantId: string, dateFrom: Date) {
  try {
    const allOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: dateFrom },
        status: { not: "CANCELLED" },
      },
      include: {
        items: { select: { name: true, quantity: true, totalPrice: true, unitPrice: true } },
        waiter: { select: { firstName: true, lastName: true } },
        table: { select: { number: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const meatOrders = allOrders.filter((o) =>
      o.items.some((i) => BUTCHER_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw)))
    );

    let totalRevenue = 0;
    let totalItems = 0;
    const meatItems: { orderNumber: number; name: string; quantity: number; totalPrice: number }[] = [];

    meatOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (BUTCHER_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw))) {
          const itemTotal = i.totalPrice || i.unitPrice * i.quantity;
          totalRevenue += itemTotal;
          totalItems += i.quantity || 1;
          meatItems.push({
            orderNumber: o.orderNumber || 0,
            name: i.name,
            quantity: i.quantity || 1,
            totalPrice: itemTotal,
          });
        }
      });
    });

    return {
      data: { orders: meatOrders, meatItems, employees: [] },
      summary: { totalRevenue, totalTransactions: meatOrders.length, totalItems },
    };
  } catch {
    const allOrders = await readDemoJSON<any>(".demo-orders.json");
    const meatOrders = allOrders.filter((o: any) => {
      const created = new Date(o.createdAt);
      if (created < dateFrom) return false;
      if (o.status === "CANCELLED") return false;
      return (o.items || []).some((item: any) =>
        BUTCHER_KEYWORDS.some((kw) => (item.name || "").toLowerCase().includes(kw))
      );
    });

    let totalRevenue = 0;
    let totalItems = 0;
    const meatItems: any[] = [];

    meatOrders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        if (BUTCHER_KEYWORDS.some((kw) => (item.name || "").toLowerCase().includes(kw))) {
          const itemTotal = item.totalPrice || item.unitPrice * (item.quantity || 1);
          totalRevenue += itemTotal;
          totalItems += item.quantity || 1;
          meatItems.push({
            orderNumber: o.orderNumber || 0,
            name: item.name,
            quantity: item.quantity || 1,
            totalPrice: itemTotal,
          });
        }
      });
    });

    return {
      data: { orders: meatOrders, meatItems, employees: [] },
      summary: { totalRevenue, totalTransactions: meatOrders.length, totalItems },
    };
  }
}

async function fetchBartenderCashflow(restaurantId: string, dateFrom: Date) {
  try {
    const allOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: dateFrom },
        status: { not: "CANCELLED" },
      },
      include: {
        items: { select: { name: true, quantity: true, totalPrice: true, unitPrice: true } },
        waiter: { select: { firstName: true, lastName: true } },
        table: { select: { number: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const drinkOrders = allOrders.filter((o) =>
      o.items.some((i) => DRINK_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw)))
    );

    let totalRevenue = 0;
    let totalItems = 0;
    const drinkItems: { orderNumber: number; name: string; quantity: number; totalPrice: number }[] = [];

    drinkOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (DRINK_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw))) {
          const itemTotal = i.totalPrice || i.unitPrice * i.quantity;
          totalRevenue += itemTotal;
          totalItems += i.quantity || 1;
          drinkItems.push({
            orderNumber: o.orderNumber || 0,
            name: i.name,
            quantity: i.quantity || 1,
            totalPrice: itemTotal,
          });
        }
      });
    });

    return {
      data: { orders: drinkOrders, drinkItems, employees: [] },
      summary: { totalRevenue, totalTransactions: drinkOrders.length, totalItems },
    };
  } catch {
    const allOrders = await readDemoJSON<any>(".demo-orders.json");
    const drinkOrders = allOrders.filter((o: any) => {
      const created = new Date(o.createdAt);
      if (created < dateFrom) return false;
      if (o.status === "CANCELLED") return false;
      return (o.items || []).some((item: any) =>
        DRINK_KEYWORDS.some((kw) => (item.name || "").toLowerCase().includes(kw))
      );
    });

    let totalRevenue = 0;
    let totalItems = 0;
    const drinkItems: any[] = [];

    drinkOrders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        if (DRINK_KEYWORDS.some((kw) => (item.name || "").toLowerCase().includes(kw))) {
          const itemTotal = item.totalPrice || item.unitPrice * (item.quantity || 1);
          totalRevenue += itemTotal;
          totalItems += item.quantity || 1;
          drinkItems.push({
            orderNumber: o.orderNumber || 0,
            name: item.name,
            quantity: item.quantity || 1,
            totalPrice: itemTotal,
          });
        }
      });
    });

    return {
      data: { orders: drinkOrders, drinkItems, employees: [] },
      summary: { totalRevenue, totalTransactions: drinkOrders.length, totalItems },
    };
  }
}
