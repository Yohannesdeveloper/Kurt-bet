import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    const userId = (session.user as { id?: string }).id;

    const payment = await prisma.payment.create({
      data: {
        orderId: body.orderId,
        amount: body.amount,
        tipAmount: body.tipAmount || 0,
        method: body.method,
        status: "COMPLETED",
        reference: body.reference,
        notes: body.notes,
        processedById: userId,
        restaurantId,
      },
    });

    const order = await prisma.order.update({
      where: { id: body.orderId },
      data: {
        paidAmount: { increment: body.amount },
        isPaid: body.markAsPaid || false,
        status: body.markAsPaid ? "COMPLETED" : undefined,
      },
    });

    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`,
        orderId: body.orderId,
        restaurantId,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        serviceCharge: order.serviceCharge,
        discountAmount: order.discountAmount,
        tipAmount: body.tipAmount || 0,
        total: order.total,
        paidAmount: order.paidAmount,
        items: JSON.stringify(body.items || []),
        paymentMethods: JSON.stringify([body.method]),
      },
    });

    await prisma.activityLog.create({
      data: {
        restaurantId,
        userId,
        type: "PAYMENT_PROCESSED",
        description: `Payment of $${body.amount} processed for order #${order.orderNumber}`,
        entityType: "Payment",
        entityId: payment.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { payment, receipt },
    }, { status: 201 });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ success: false, error: "Payment processing failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;

    const payments = await prisma.payment.findMany({
      where: { order: { restaurantId } },
      include: {
        order: { select: { orderNumber: true, table: { select: { number: true } } } },
        processedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
