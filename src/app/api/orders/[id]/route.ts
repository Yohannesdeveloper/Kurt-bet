import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-orders.json";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: { select: { number: true, name: true } },
        waiter: { select: { firstName: true, lastName: true } },
        customer: true,
        items: {
          include: { menuItem: { select: { image: true } } },
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          include: { processedBy: { select: { firstName: true, lastName: true } } },
        },
        tickets: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order fetch error:", error);
    const [demoOrders, menuItems] = await Promise.all([
      readDemoJSON<any>(DEMO_FILE),
      readDemoJSON<any>(".demo-menu-items.json"),
    ]);
    const menuMap = new Map(menuItems.map((mi: any) => [mi.id, mi]));
    const demoWithImages = demoOrders.map((o: any) => ({
      ...o,
      approved: o.approved ?? false,
      items: (o.items || []).map((item: any) => ({
        ...item,
        menuItem: menuMap.has(item.menuItemId) ? { image: menuMap.get(item.menuItemId).image } : null,
      })),
    }));
    const demo = demoWithImages.find((o: any) => o.id === params.id);
    if (!demo) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: demo });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Only admins can delete orders" }, { status: 403 });
  }

  try {
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    const demoOrders = await readDemoJSON<any>(DEMO_FILE);
    const idx = demoOrders.findIndex((o: any) => o.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    demoOrders.splice(idx, 1);
    await writeDemoJSON(DEMO_FILE, demoOrders);
    return NextResponse.json({ success: true });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "KITCHEN" && role !== "WAITER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Handle item removal
    if (body.removeItemId) {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }
      const updatedItems = order.items.filter(i => i.id !== body.removeItemId);
      const subtotal = updatedItems.reduce((s, i) => s + i.totalPrice, 0);
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: {
          items: { deleteMany: { id: body.removeItemId } },
          subtotal,
          total: subtotal,
        },
        include: { items: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
        completedAt: body.status === "COMPLETED" || body.status === "CANCELLED" ? new Date() : undefined,
      },
      include: { items: true, payments: true },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order update error (demo mode):", error);
    if (!body) return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    const [demoOrders, menuItems] = await Promise.all([
      readDemoJSON<any>(DEMO_FILE),
      readDemoJSON<any>(".demo-menu-items.json"),
    ]);
    const menuMap = new Map(menuItems.map((mi: any) => [mi.id, mi]));
    const demoOrdersMap = demoOrders.map((o: any) => ({
      ...o,
      approved: o.approved ?? false,
      items: (o.items || []).map((item: any) => ({
        ...item,
        menuItem: menuMap.has(item.menuItemId) ? { image: menuMap.get(item.menuItemId).image } : null,
      })),
    }));
    const idx = demoOrders.findIndex((o: any) => o.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Handle item removal in demo mode
    if (body.removeItemId) {
      const oldItems = demoOrders[idx].items || [];
      const newItems = oldItems.filter((i: any) => i.id !== body.removeItemId);
      const subtotal = newItems.reduce((s: number, i: any) => s + i.totalPrice, 0);
      demoOrders[idx] = { ...demoOrders[idx], items: newItems, subtotal, total: subtotal, updatedAt: new Date().toISOString() };
      demoOrdersMap[idx] = { ...demoOrdersMap[idx], items: newItems, subtotal, total: subtotal, updatedAt: new Date().toISOString() };
      await writeDemoJSON(DEMO_FILE, demoOrders);
      return NextResponse.json({ success: true, data: demoOrdersMap[idx] });
    }

    demoOrders[idx] = { ...demoOrders[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.status === "COMPLETED" || body.status === "CANCELLED") {
      demoOrders[idx].completedAt = new Date().toISOString();
    }
    demoOrdersMap[idx] = { ...demoOrdersMap[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.status === "COMPLETED" || body.status === "CANCELLED") {
      demoOrdersMap[idx].completedAt = new Date().toISOString();
    }
    await writeDemoJSON(DEMO_FILE, demoOrders);
    return NextResponse.json({ success: true, data: demoOrdersMap[idx] });
  }
}
