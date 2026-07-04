import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-restaurant" },
    update: {},
    create: {
      name: "Demo Restaurant",
      slug: "demo-restaurant",
      email: "info@demorestaurant.com",
      phone: "+1 555-0000",
      address: "123 Main Street, New York, NY 10001",
      currency: "USD",
      taxRate: 8.875,
      serviceCharge: 10.0,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: "ADMIN" } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "ADMIN",
      description: "Full system access - Admin Manager",
      permissions: ["*"],
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: "CLIENT" } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "CLIENT",
      description: "Customer access - browse menu, place orders",
      permissions: ["menu.read", "orders.create", "orders.read", "reservations.create", "reservations.read"],
    },
  });

  const kitchenRole = await prisma.role.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: "KITCHEN" } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "KITCHEN",
      description: "Kitchen Employee - view and update orders",
      permissions: ["kitchen.read", "kitchen.update", "orders.read", "menu.read"],
    },
  });

  const waiterRole = await prisma.role.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: "WAITER" } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "WAITER",
      description: "Waiter - create orders, manage tables, process payments",
      permissions: ["orders.create", "orders.read", "orders.update", "tables.read", "tables.update", "payments.create", "menu.read"],
    },
  });

  const bartenderRole = await prisma.role.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: "BARTENDER" } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "BARTENDER",
      description: "Bartender - manage drinks and beverages",
      permissions: ["menu.read", "orders.read", "orders.update"],
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: {
      email: "admin@restaurant.com",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "Manager",
      roleId: adminRole.id,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@restaurant.com" },
    update: {},
    create: {
      email: "client@restaurant.com",
      passwordHash: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      roleId: clientRole.id,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: "kitchen@restaurant.com" },
    update: {},
    create: {
      email: "kitchen@restaurant.com",
      passwordHash: hashedPassword,
      firstName: "Chef",
      lastName: "Gordon",
      roleId: kitchenRole.id,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: "waiter@restaurant.com" },
    update: {},
    create: {
      email: "waiter@restaurant.com",
      passwordHash: hashedPassword,
      firstName: "Sarah",
      lastName: "Smith",
      roleId: waiterRole.id,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  const bartender = await prisma.user.upsert({
    where: { email: "bartender@restaurant.com" },
    update: {},
    create: {
      email: "bartender@restaurant.com",
      passwordHash: hashedPassword,
      firstName: "Mekdes",
      lastName: "Alemayehu",
      roleId: bartenderRole.id,
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  console.log({ restaurant, admin, client, kitchen, waiter, bartender });
  console.log("\n=== Test Users Created ===");
  console.log("Admin: admin@restaurant.com / admin123");
  console.log("Client: client@restaurant.com / admin123");
  console.log("Kitchen: kitchen@restaurant.com / admin123");
  console.log("Waiter: waiter@restaurant.com / admin123");
  console.log("Bartender: bartender@restaurant.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
