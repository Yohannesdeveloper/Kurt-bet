import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const employees = await prisma.user.findMany({
      where: { restaurantId },
      include: { role: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const roles = await prisma.role.findMany({
      where: { restaurantId },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json({ success: true, data: { employees, roles } });
  } catch (error) {
    console.error("Employees fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    const body = await req.json();

    const passwordHash = body.password ? await bcrypt.hash(body.password, 12) : await bcrypt.hash("changeme123", 12);

    const employee = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        roleId: body.roleId,
        restaurantId,
        branchId: body.branchId || null,
      },
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
    }
    console.error("Employee create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
