import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const tableReservation = reservations.find((r: any) => r.tableId === tableId && (r.status === "PENDING" || r.status === "CONFIRMED"));
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
      reservation: tableReservation ? { id: tableReservation.id, guestName: tableReservation.guestName, guestCount: tableReservation.guestCount, dateTime: tableReservation.dateTime, duration: tableReservation.duration } : null,
      _count: { orders: activeOrders.length },
    };
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const restaurantId = (session?.user as { restaurantId?: string })?.restaurantId;

    if (restaurantId) {
      try {
        const [tables, orders, reservations] = await Promise.all([
          prisma.restaurantTable.findMany({
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
          }),
          readDemoJSON<any>(".demo-orders.json"),
          readDemoJSON<any>(".demo-reservations.json"),
        ]);

        if (tables.length > 0) {
          const occupiedTableIds = new Set(
            orders.filter((o: any) => ACTIVE_STATUSES.includes(o.status) && o.tableId).map((o: any) => o.tableId)
          );
          const reservedTableIds = new Set(
            reservations.filter((r: any) => r.status === "PENDING" || r.status === "CONFIRMED").map((r: any) => r.tableId).filter(Boolean)
          );
          const mapped = tables.map((t: any) => {
            const tableReservation = reservations.find((r: any) => r.tableId === t.id && (r.status === "PENDING" || r.status === "CONFIRMED"));
            let status = t.status;
            if (occupiedTableIds.has(t.id)) status = "OCCUPIED";
            else if (reservedTableIds.has(t.id)) status = "RESERVED";
            return {
              ...t,
              status,
              guestCount: t.orders.reduce((sum: number, o: any) => sum + ((o as any).guestCount || 1), 0),
              reservation: tableReservation ? { id: tableReservation.id, guestName: tableReservation.guestName, guestCount: tableReservation.guestCount, dateTime: tableReservation.dateTime, duration: tableReservation.duration } : null,
            };
          });
          return NextResponse.json({ success: true, data: mapped });
        }
      } catch (error) {
        console.error("Tables fetch error (demo mode):", error);
      }
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
