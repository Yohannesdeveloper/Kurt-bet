import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const ORDERS_FILE = ".demo-orders.json";
const BUTCHER_FILE = ".demo-butcher-orders.json";

const KDS_STATUSES = ["NEW", "PREPARING", "READY", "SERVED"];

export async function DELETE() {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = (session?.user as { role?: string })?.role;
  const restaurantId = (session?.user as { restaurantId?: string })?.restaurantId;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Only admins can clear history" }, { status: 403 });
  }
  if (!restaurantId) {
    return NextResponse.json({ success: false, error: "No restaurant" }, { status: 400 });
  }

  let orderCount = 0;

  try {
    const { count } = await prisma.order.deleteMany({
      where: { status: { in: KDS_STATUSES as any }, restaurantId },
    });
    orderCount = count;
  } catch {
    const orders = await readDemoJSON<any>(ORDERS_FILE).catch(() => [] as any[]);
    const before = orders.length;
    const remaining = orders.filter((o: any) => !KDS_STATUSES.includes(o.status));
    if (remaining.length !== before) {
      await writeDemoJSON(ORDERS_FILE, remaining).catch(() => {});
    }
    orderCount = before - remaining.length;
  }

  await writeDemoJSON(BUTCHER_FILE, []).catch(() => {});

  return NextResponse.json({ success: true, orderCount, butcherCleared: true });
}
