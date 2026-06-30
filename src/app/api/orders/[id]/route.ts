import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";

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
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
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

    await prisma.activityLog.create({
      data: {
        restaurantId: order.restaurantId,
        userId: (session.user as { id?: string }).id,
        type: "ORDER_UPDATED",
        description: `Order #${order.orderNumber} updated to ${body.status}`,
        entityType: "Order",
        entityId: order.id,
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
