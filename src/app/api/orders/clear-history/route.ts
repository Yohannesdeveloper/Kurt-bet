import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-orders.json";

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

  try {
    const { count } = await prisma.order.deleteMany({
      where: { status: "SERVED", restaurantId },
    });
    return NextResponse.json({ success: true, count });
  } catch {
    const demoOrders = await readDemoJSON<any>(DEMO_FILE).catch(() => [] as any[]);
    const before = demoOrders.length;
    const remaining = demoOrders.filter(
      (o: any) => o.restaurantId === restaurantId ? o.status !== "SERVED" : true
    );
    if (remaining.length !== before) {
      await writeDemoJSON(DEMO_FILE, remaining).catch(() => {});
    }
    return NextResponse.json({ success: true, count: before - remaining.length });
  }
}
