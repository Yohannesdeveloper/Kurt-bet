import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

async function readDemoReservations(): Promise<any[]> { return readDemoJSON(".demo-reservations.json"); }
async function writeDemoReservations(items: any[]) { await writeDemoJSON(".demo-reservations.json", items); }

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as { id?: string })?.id;
    const currentRole = (session?.user as { role?: string })?.role;
    const isStaff = currentRole === "ADMIN" || currentRole === "WAITER" || currentRole === "KITCHEN";
    const reservations = await readDemoReservations();
    const filtered = isStaff || !currentUserId
      ? reservations
      : reservations.filter((r: any) => r.userId === currentUserId);
    return NextResponse.json({ success: true, data: filtered });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const currentUserId = (session?.user as { id?: string })?.id;
    const body = await req.json();
    const reservations = await readDemoReservations();
    const demo = {
      id: `demo-res-${Date.now()}`,
      ...body,
      status: "CONFIRMED",
      userId: currentUserId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reservations.push(demo);
    await writeDemoReservations(reservations);
    return NextResponse.json({ success: true, data: demo }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create reservation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { tableId, action } = await req.json();
    const reservations = await readDemoReservations();
    const idx = reservations.findIndex((r: any) => r.tableId === tableId && (r.status === "PENDING" || r.status === "CONFIRMED"));
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "No active reservation found" }, { status: 404 });
    }
    reservations[idx].status = action === "cancel" ? "CANCELLED" : "COMPLETED";
    reservations[idx].updatedAt = new Date().toISOString();
    await writeDemoReservations(reservations);
    return NextResponse.json({ success: true, data: reservations[idx] });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update reservation" }, { status: 500 });
  }
}
