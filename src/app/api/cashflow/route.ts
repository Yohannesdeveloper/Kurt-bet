import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON } from "@/lib/demo-storage";

const BUTCHER_KEYWORDS = ["tibs", "kurt", "kitfo", "dulet", "tere sega", "gored gored", "awaze tibs", "zilzil tibs", "shekla tibs", "lamb tibs", "tere siga"];
const DRINK_KEYWORDS = ["coffee", "macchiato", "tej", "tella", "tea", "spris", "juice", "ambo", "soft drink", "besso", "atmet", "halwa", "cheesecake", "atayef", "water", "soda", "beer", "wine"];

function isButcherItem(name: string): boolean {
  return BUTCHER_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
}
function isDrinkItem(name: string): boolean {
  return DRINK_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const employeeFilter = searchParams.get("employee"); // "butcher" | "bartender" | "waiter" | null (all)

  try {
    const DEMO_FILE = ".demo-orders.json";
    const orders = await readDemoJSON<any>(DEMO_FILE);
    const activeOrders = orders.filter((o: any) => o.status !== "CANCELLED");

    let waiterRevenue = 0;
    let waiterCount = 0;
    let butcherRevenue = 0;
    let butcherCount = 0;
    let bartenderRevenue = 0;
    let bartenderCount = 0;
    let totalRevenue = 0;

    const waiterTransactions: any[] = [];
    const butcherTransactions: any[] = [];
    const bartenderTransactions: any[] = [];

    activeOrders.forEach((o: any) => {
      const orderTotal = o.total || 0;
      totalRevenue += orderTotal;
      waiterRevenue += orderTotal;
      waiterCount++;

      waiterTransactions.push({
        id: o.id,
        orderNumber: o.orderNumber,
        total: orderTotal,
        status: o.status,
        itemCount: (o.items || []).length,
        date: o.createdAt,
      });

      let orderButcherTotal = 0;
      let orderBartenderTotal = 0;
      let orderButcherItems: any[] = [];
      let orderBartenderItems: any[] = [];

      (o.items || []).forEach((item: any) => {
        const itemTotal = item.totalPrice || item.unitPrice * (item.quantity || 1);
        if (isButcherItem(item.name)) {
          butcherRevenue += itemTotal;
          butcherCount += item.quantity || 1;
          orderButcherTotal += itemTotal;
          orderButcherItems.push(item);
        }
        if (isDrinkItem(item.name)) {
          bartenderRevenue += itemTotal;
          bartenderCount += item.quantity || 1;
          orderBartenderTotal += itemTotal;
          orderBartenderItems.push(item);
        }
      });

      if (orderButcherTotal > 0) {
        butcherTransactions.push({
          id: o.id,
          orderNumber: o.orderNumber,
          total: orderButcherTotal,
          items: orderButcherItems,
          date: o.createdAt,
        });
      }
      if (orderBartenderTotal > 0) {
        bartenderTransactions.push({
          id: o.id,
          orderNumber: o.orderNumber,
          total: orderBartenderTotal,
          items: orderBartenderItems,
          date: o.createdAt,
        });
      }
    });

    const summary = {
      totalRevenue,
      waiterRevenue,
      waiterCount,
      butcherRevenue,
      butcherCount,
      bartenderRevenue,
      bartenderCount,
    };

    if (employeeFilter === "butcher") {
      return NextResponse.json({
        success: true,
        data: { summary, transactions: butcherTransactions },
      });
    }
    if (employeeFilter === "bartender") {
      return NextResponse.json({
        success: true,
        data: { summary, transactions: bartenderTransactions },
      });
    }
    if (employeeFilter === "waiter") {
      return NextResponse.json({
        success: true,
        data: { summary, transactions: waiterTransactions },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        transactions: {
          waiter: waiterTransactions,
          butcher: butcherTransactions,
          bartender: bartenderTransactions,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch cashflow data",
    }, { status: 500 });
  }
}
