import { NextRequest, NextResponse } from "next/server";
import { readDemoJSON, writeDemoJSON } from "@/lib/demo-storage";

async function readDemoReservations(): Promise<any[]> { return readDemoJSON(".demo-reservations.json"); }
async function writeDemoReservations(items: any[]) { await writeDemoJSON(".demo-reservations.json", items); }

export async function GET() {
  try {
    const reservations = await readDemoReservations();
    return NextResponse.json({ success: true, data: reservations });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reservations = await readDemoReservations();
    const demo = {
      id: `demo-res-${Date.now()}`,
      ...body,
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
