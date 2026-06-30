import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

const DEMO_FILE = ".demo-orders.json";

export async function GET(req: NextRequest) {
  let status: string | null = null;
  let approvedFilter: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    const searchParams = req.nextUrl.searchParams;
    status = searchParams.get("status");
    approvedFilter = searchParams.get("approved");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: Record<string, unknown> = { restaurantId };
    if (status && status !== "all") {
      if (status.includes(",")) {
        where.status = { in: status.split(",") };
      } else {
        where.status = status;
      }
    }
    if (approvedFilter === "true") where.approved = true;
    if (approvedFilter === "false") where.approved = false;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          table: { select: { number: true, name: true } },
          waiter: { select: { firstName: true, lastName: true } },
          customer: { select: { firstName: true, lastName: true } },
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
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders fetch error (demo mode):", error);
    const demoOrders = (await readDemoJSON<any>(DEMO_FILE)).map((o: any) => ({ ...o, approved: o.approved ?? false }));
    const statusFilter = status;
    const filtered = demoOrders.filter((o: any) => {
      const matchesStatus = !statusFilter || statusFilter === "all" || statusFilter.split(",").includes(o.status);
      const matchesApproved = approvedFilter === null || o.approved === (approvedFilter === "true");
      return matchesStatus && matchesApproved;
    });
    return NextResponse.json({
      success: true,
      data: filtered,
      meta: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
    });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    body = await req.json();
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    const userId = (session.user as { id?: string }).id;

    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableId: body.tableId,
        waiterId: body.waiterId || userId,
        customerId: body.customerId,
        type: body.type || "DINE_IN",
        notes: body.notes,
        customerNotes: body.customerNotes,
        guestCount: body.guestCount || 1,
        subtotal: body.subtotal || 0,
        taxAmount: body.taxAmount || 0,
        serviceCharge: body.serviceCharge || 0,
        total: body.total || 0,
        items: {
          create: (body.items || []).map((item: any, index: number) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            variant: item.variant,
            extras: item.extras ? JSON.stringify(item.extras) : "[]",
            modifiers: item.modifiers ? JSON.stringify(item.modifiers) : "[]",
            cookingNotes: item.cookingNotes,
            instructions: item.instructions,
            sortOrder: index,
          })),
        },
      },
      include: {
        table: { select: { number: true, name: true } },
        waiter: { select: { firstName: true, lastName: true } },
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Order create error (demo mode):", error);
    const demoOrders = await readDemoJSON<any>(DEMO_FILE);
    const nextNumber = demoOrders.length > 0 ? Math.max(...demoOrders.map((o: any) => o.orderNumber)) + 1 : 1001;
    const demoOrder = {
      id: `demo-order-${Date.now()}`,
      orderNumber: nextNumber,
      restaurantId: "demo",
      tableId: body?.tableId || null,
      waiterId: null,
      customerId: null,
      approved: false,
      status: "NEW",
      type: body?.type || "DINE_IN",
      subtotal: body?.subtotal || 0,
      taxAmount: 0,
      serviceCharge: 0,
      discountAmount: 0,
      total: body?.total || 0,
      paidAmount: 0,
      changeAmount: 0,
      notes: body?.notes || null,
      customerNotes: null,
      isPaid: false,
      isTakeaway: false,
      isDelivery: false,
      deliveryAddress: null,
      guestCount: body?.guestCount || 1,
      preparationTime: 0,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      table: null,
      waiter: null,
      items: (body?.items || []).map((item: any, i: number) => ({
        id: `demo-oi-${i}`,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        variant: null,
        extras: "[]",
        modifiers: "[]",
        cookingNotes: null,
        instructions: null,
        status: "NEW",
        sortOrder: i,
      })),
    };
    demoOrders.unshift(demoOrder);
    await writeDemoJSON(DEMO_FILE, demoOrders);
    return NextResponse.json({ success: true, data: demoOrder }, { status: 201 });
  }
}
