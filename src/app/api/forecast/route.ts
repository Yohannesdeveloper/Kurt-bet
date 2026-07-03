import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const restaurantId = (session.user as { restaurantId?: string }).restaurantId;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: thirtyDaysAgo },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, total: true, items: { select: { menuItemId: true, quantity: true } } },
    });

    const ordersByDay: Record<string, { count: number; revenue: number }> = {};
    const itemFrequency: Record<string, number> = {};

    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split("T")[0];
      if (!ordersByDay[day]) ordersByDay[day] = { count: 0, revenue: 0 };
      ordersByDay[day].count++;
      ordersByDay[day].revenue += order.total;

      order.items.forEach((item) => {
        itemFrequency[item.menuItemId] = (itemFrequency[item.menuItemId] || 0) + item.quantity;
      });
    });

    const dailyCounts = Object.values(ordersByDay).map((d) => d.count);
    const avgOrders = dailyCounts.length > 0 ? Math.round(dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length) : 0;
    const avgRevenue = dailyCounts.length > 0 ? Object.values(ordersByDay).reduce((a, b) => a + b.revenue, 0) / dailyCounts.length : 0;

    const growthRate = dailyCounts.length >= 7
      ? ((dailyCounts.slice(-7).reduce((a, b) => a + b, 0) - dailyCounts.slice(0, 7).reduce((a, b) => a + b, 0)) / dailyCounts.slice(0, 7).reduce((a, b) => a + b, 0) * 100).toFixed(1)
      : "0";

    const topItemIds = Object.entries(itemFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const topItems = await prisma.menuItem.findMany({
      where: { id: { in: topItemIds } },
      select: { id: true, name: true },
    });

    const forecast = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0;
      const predictedOrders = Math.round(avgOrders * weekendMultiplier * (1 + parseFloat(growthRate) / 100));
      const predictedRevenue = avgRevenue * weekendMultiplier * (1 + parseFloat(growthRate) / 100);

      forecast.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        predictedOrders,
        predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        confidence: weekendMultiplier > 1 ? "medium" : "high",
      });
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { restaurantId, isActive: true },
      select: { id: true, name: true, currentStock: true, minStock: true, costPerUnit: true },
    });

    const inventoryAlerts = inventoryItems
      .filter((item) => item.currentStock <= item.minStock * 1.5)
      .map((item) => ({
        id: item.id,
        name: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        daysRemaining: item.currentStock <= 0 ? 0 : Math.max(1, Math.round(item.currentStock / Math.max(1, avgOrders * 0.1))),
        status: item.currentStock <= item.minStock ? "critical" : "low",
      }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          averageDailyOrders: avgOrders,
          averageDailyRevenue: Math.round(avgRevenue * 100) / 100,
          growthRate: parseFloat(growthRate),
          totalOrders30Days: orders.length,
        },
        forecast,
        topSellingItems: topItems.map((item) => ({
          ...item,
          frequency: itemFrequency[item.id] || 0,
        })),
        inventoryAlerts,
      },
    });
  } catch (error) {
    console.error("Forecast error:", error);
    return NextResponse.json({ success: false, error: "Forecast failed" }, { status: 500 });
  }
}
