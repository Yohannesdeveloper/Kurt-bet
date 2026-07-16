import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { readDemoJSON } from "@/lib/demo-storage";

const ACTIVE_STATUSES = ["NEW", "PREPARING", "READY"];

function getDemoTables(orders: any[], reservations: any[]) {
  const occupiedTableIds = new Set(
    orders
      .filter((o: any) => ACTIVE_STATUSES.includes(o.status) && o.tableId)
      .map((o: any) => o.tableId)
  );
  const reservedTableIds = new Set(
    reservations
      .filter((r: any) => r.status === "PENDING" || r.status === "CONFIRMED")
      .map((r: any) => r.tableId)
      .filter(Boolean)
  );
  return Array.from({ length: 12 }, (_, i) => {
    const tableId = `table-${i + 1}`;
    const activeOrders = orders.filter((o: any) => o.tableId === tableId && ACTIVE_STATUSES.includes(o.status));
    let status = "AVAILABLE";
    if (occupiedTableIds.has(tableId)) status = "OCCUPIED";
    else if (reservedTableIds.has(tableId)) status = "RESERVED";
    return {
      id: tableId,
      number: i + 1,
      name: `Table ${i + 1}`,
      capacity: 4,
      status,
      section: i < 6 ? "Main" : "Patio",
      waiter: null,
      guestCount: activeOrders.reduce((sum: number, o: any) => sum + (o.guestCount || 1), 0),
      orders: activeOrders.map((o: any) => ({ id: o.id, total: o.total, status: o.status, guestCount: o.guestCount })),
      _count: { orders: activeOrders.length },
    };
  });
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;

    try {
      const tables = await prisma.restaurantTable.findMany({
        where: { restaurantId, isActive: true },
        include: {
          waiter: { select: { id: true, firstName: true, lastName: true } },
          orders: {
            where: { status: { in: ["NEW", "PREPARING", "READY", "SERVED"] } },
            select: { id: true, total: true, status: true },
          },
          _count: { select: { orders: true } },
        },
        orderBy: { number: "asc" },
      });

      if (tables.length > 0) {
        return NextResponse.json({ success: true, data: tables });
      }
    } catch (error) {
      console.error("Tables fetch error (demo mode):", error);
    }

    const [orders, reservations] = await Promise.all([
      readDemoJSON<any>(".demo-orders.json"),
      readDemoJSON<any>(".demo-reservations.json"),
    ]);
    return NextResponse.json({ success: true, data: getDemoTables(orders, reservations) });
  } catch {
    return NextResponse.json({ success: true, data: getDemoTables([], []) });
  }
}
