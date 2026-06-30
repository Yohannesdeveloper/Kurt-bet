import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DEMO_FILE = path.join(process.cwd(), ".demo-orders.json");

function readDemoOrders(): any[] {
  try {
    if (fs.existsSync(DEMO_FILE)) {
      return JSON.parse(fs.readFileSync(DEMO_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeDemoOrders(orders: any[]) {
  try {
    fs.writeFileSync(DEMO_FILE, JSON.stringify(orders, null, 2));
  } catch {}
}

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
    const demoOrders = readDemoOrders();
    const demo = demoOrders.find((o: any) => o.id === params.id);
    if (!demo) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: demo });
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

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
        notes: body.notes,
        tableId: body.tableId,
        waiterId: body.waiterId,
        isPaid: body.isPaid,
        paidAmount: body.paidAmount,
        total: body.total,
        subtotal: body.subtotal,
        discountAmount: body.discountAmount,
        completedAt: body.status === "COMPLETED" || body.status === "CANCELLED" ? new Date() : undefined,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order update error (demo mode):", error);
    if (!body) return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    const demoOrders = readDemoOrders();
    const idx = demoOrders.findIndex((o: any) => o.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    demoOrders[idx] = { ...demoOrders[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.status === "COMPLETED" || body.status === "CANCELLED") {
      demoOrders[idx].completedAt = new Date().toISOString();
    }
    writeDemoOrders(demoOrders);
    return NextResponse.json({ success: true, data: demoOrders[idx] });
  }
}
