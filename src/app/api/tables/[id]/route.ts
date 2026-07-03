import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const table = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: {
        number: body.number,
        name: body.name,
        capacity: body.capacity,
        section: body.section,
        shape: body.shape,
        posX: body.posX,
        posY: body.posY,
        status: body.status,
        waiterId: body.waiterId,
      },
    });

    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    console.error("Table update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    await prisma.restaurantTable.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    console.error("Table delete error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const table = await prisma.restaurantTable.findUnique({
      where: { id: params.id },
      include: {
        waiter: { select: { firstName: true, lastName: true } },
        orders: { where: { status: { in: ["NEW", "PREPARING", "READY", "SERVED"] } } },
        reservations: { where: { status: "CONFIRMED", dateTime: { gte: new Date() } } },
      },
    });

    if (!table) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    console.error("Table fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
