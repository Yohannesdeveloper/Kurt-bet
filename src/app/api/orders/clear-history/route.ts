import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-orders.json";

export async function DELETE() {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Only admins can clear history" }, { status: 403 });
  }

  try {
    const { count } = await prisma.order.deleteMany({ where: { status: "SERVED" } });
    return NextResponse.json({ success: true, count });
  } catch {
    const demoOrders = await readDemoJSON<any>(DEMO_FILE);
    const remaining = demoOrders.filter((o: any) => o.status !== "SERVED");
    await writeDemoJSON(DEMO_FILE, remaining);
    return NextResponse.json({ success: true, count: demoOrders.length - remaining.length });
  }
}
