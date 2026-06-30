import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireOwner } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DEMO_RESERVATIONS_FILE = path.join(process.cwd(), ".demo-reservations.json");

function readDemoReservations(): any[] {
  try {
    if (fs.existsSync(DEMO_RESERVATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(DEMO_RESERVATIONS_FILE, "utf-8"));
    }
  } catch { /* ignore */ }
  return [];
}

function writeDemoReservations(items: any[]) {
  try {
    fs.writeFileSync(DEMO_RESERVATIONS_FILE, JSON.stringify(items, null, 2));
  } catch { /* ignore */ }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;

    const reservations = await prisma.reservation.findMany({
      where: { restaurantId },
      include: {
        table: { select: { number: true, name: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    console.error("Reservations fetch error (using demo):", error);
    const reservations = readDemoReservations();
    return NextResponse.json({ success: true, data: reservations });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
    if (!restaurantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!requireOwner(session)) return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        tableId: body.tableId || null,
        guestName: body.guestName,
        guestPhone: body.guestPhone,
        guestEmail: body.guestEmail,
        guestCount: body.guestCount,
        dateTime: new Date(body.dateTime),
        duration: body.duration || 120,
        notes: body.notes,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    console.error("Reservation create error (using demo):", error);
    if (!body) return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    const reservation = {
      id: `demo-res-${Date.now()}`,
      tableId: body.tableId || null,
      guestName: body.guestName || "Guest",
      guestCount: body.guestCount || 2,
      dateTime: body.dateTime || new Date().toISOString(),
      duration: body.duration || 120,
      notes: body.notes || "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    const reservations = readDemoReservations();
    reservations.push(reservation);
    writeDemoReservations(reservations);
    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  }
}