import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { onOrderReady, onKurtPickupReady } from "@/lib/notification-emitter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const restaurantId = (session.user as { restaurantId?: string }).restaurantId;
  if (!restaurantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let cleanupKurt: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 2000\n\n"));

      cleanup = onOrderReady(restaurantId, (data) => {
        const message = `data: ${JSON.stringify({ type: "ORDER_READY", ...data })}\n\n`;
        controller.enqueue(encoder.encode(message));
      });

      cleanupKurt = onKurtPickupReady(restaurantId, (data) => {
        const message = `data: ${JSON.stringify({ type: "KURT_PICKUP_READY", ...data })}\n\n`;
        controller.enqueue(encoder.encode(message));
      });

      req.signal.addEventListener("abort", () => {
        if (cleanup) cleanup();
        if (cleanupKurt) cleanupKurt();
      });
    },
    cancel() {
      if (cleanup) cleanup();
      if (cleanupKurt) cleanupKurt();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
