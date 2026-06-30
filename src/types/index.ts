import type { User } from "next-auth";

export type { AuthUser } from "@/lib/auth";

export interface TablePosition {
  id: string;
  number: number;
  name: string | null;
  capacity: number;
  shape: "rectangle" | "circle" | "square";
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  status: TableStatusType;
  section: string | null;
  waiterId: string | null;
  waiterName?: string;
  orderCount?: number;
}

export type TableStatusType =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "CLEANING"
  | "WAITING_BILL"
  | "CLOSED";

export type OrderStatusType =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";

export type TicketStatusType =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED"
  | "PAUSED";

export interface MenuItemWithRelations {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  cost: number;
  image: string | null;
  images: string[];
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  allergens: string[];
  ingredients: string[];
  nutritionalInfo: Record<string, unknown>;
  sortOrder: number;
  category: {
    id: string;
    name: string;
  };
  variants: {
    id: string;
    name: string;
    price: number;
    isDefault: boolean;
    isAvailable: boolean;
  }[];
  extras: {
    id: string;
    name: string;
    price: number;
    maxSelect: number;
  }[];
}

export interface OrderWithItems {
  id: string;
  orderNumber: number;
  restaurantId: string;
  branchId: string | null;
  tableId: string | null;
  table: { number: number; name: string | null } | null;
  waiterId: string | null;
  waiter: { firstName: string; lastName: string } | null;
  customerId: string | null;
  customer: { firstName: string; lastName: string } | null;
  status: OrderStatusType;
  type: string;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  notes: string | null;
  customerNotes: string | null;
  isPaid: boolean;
  isTakeaway: boolean;
  isDelivery: boolean;
  deliveryAddress: string | null;
  guestCount: number;
  preparationTime: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemWithDetails[];
  payments: PaymentWithDetails[];
  tickets: KitchenTicketWithItems[];
}

export interface OrderItemWithDetails {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: string | null;
  extras: string[];
  modifiers: string[];
  cookingNotes: string | null;
  instructions: string | null;
  status: string;
  menuItem: { image: string | null };
}

export interface KitchenTicketWithItems {
  id: string;
  ticketNumber: number;
  status: TicketStatusType;
  priority: number;
  station: string | null;
  preparedBy: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  items: KitchenTicketItemType[];
}

export interface KitchenTicketItemType {
  id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes: string | null;
  status: TicketStatusType;
}

export interface PaymentWithDetails {
  id: string;
  amount: number;
  tipAmount: number;
  method: string;
  status: string;
  reference: string | null;
  notes: string | null;
  processedById: string | null;
  processedBy: { firstName: string; lastName: string } | null;
  createdAt: Date;
}

export interface DashboardStats {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  ordersToday: number;
  activeTables: number;
  totalTables: number;
  averageOrderTime: number;
  averagePreparationTime: number;
  topSellingFoods: { id: string; name: string; count: number; revenue: number }[];
  topSellingDrinks: { id: string; name: string; count: number; revenue: number }[];
  bestWaiter: { id: string; name: string; orderCount: number } | null;
  revenueByDay: { date: string; revenue: number }[];
  peakHours: { hour: number; orders: number }[];
  statusCounts: { status: string; count: number }[];
  cancelledOrders: number;
  totalRefunds: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
}

export interface WSMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundImage: string | null;
  tables: TablePosition[];
}
