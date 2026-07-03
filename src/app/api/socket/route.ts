import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Socket.IO server is running alongside Next.js",
    note: "In production, the Socket.IO server runs on the same port via the custom server configuration",
  });
}
