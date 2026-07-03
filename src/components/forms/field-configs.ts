import type { FieldConfig } from "@/components/shared/crud-form-dialog";

export const menuItemFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", placeholder: "Item name", required: true },
  { name: "description", label: "Description", type: "textarea", placeholder: "Item description" },
  { name: "price", label: "Price", type: "number", placeholder: "0.00", required: true, min: 0, step: 0.01 },
  { name: "cost", label: "Cost", type: "number", placeholder: "0.00", min: 0, step: 0.01 },
  { name: "categoryId", label: "Category", type: "select", required: true, options: [] },
  { name: "preparationTime", label: "Prep Time (min)", type: "number", placeholder: "15", min: 1 },
  { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "0", min: 0 },
];

export const categoryFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", placeholder: "Category name", required: true },
  { name: "description", label: "Description", type: "textarea", placeholder: "Category description" },
  { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "0", min: 0 },
];

export const tableFields: FieldConfig[] = [
  { name: "number", label: "Table Number", type: "number", placeholder: "1", required: true, min: 1 },
  { name: "name", label: "Display Name", type: "text", placeholder: "Window 1" },
  { name: "capacity", label: "Capacity", type: "number", placeholder: "4", required: true, min: 1 },
  { name: "section", label: "Section", type: "text", placeholder: "Main" },
  { name: "shape", label: "Shape", type: "select", options: [
    { label: "Rectangle", value: "rectangle" },
    { label: "Circle", value: "circle" },
    { label: "Square", value: "square" },
  ]},
  { name: "posX", label: "Position X", type: "number", placeholder: "0", min: 0 },
  { name: "posY", label: "Position Y", type: "number", placeholder: "0", min: 0 },
];

export const employeeFields: FieldConfig[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "John", required: true },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Doe", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "john@restaurant.com", required: true },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555-0000" },
  { name: "roleId", label: "Role", type: "select", required: true, options: [] },
  { name: "password", label: "Password", type: "password", placeholder: "Leave blank to keep current" },
];

export const customerFields: FieldConfig[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "Jane", required: true },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Smith", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "jane@email.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555-0000" },
  { name: "birthday", label: "Birthday", type: "date" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Customer preferences..." },
];

export const inventoryFields: FieldConfig[] = [
  { name: "name", label: "Item Name", type: "text", placeholder: "Beef Patty", required: true },
  { name: "sku", label: "SKU", type: "text", placeholder: "BEEF-001" },
  { name: "category", label: "Category", type: "text", placeholder: "Meat" },
  { name: "unit", label: "Unit", type: "text", placeholder: "pieces, kg, liters", required: true },
  { name: "currentStock", label: "Current Stock", type: "number", placeholder: "0", min: 0, step: 0.1 },
  { name: "minStock", label: "Min Stock", type: "number", placeholder: "10", min: 0, step: 0.1 },
  { name: "maxStock", label: "Max Stock", type: "number", placeholder: "100", min: 0, step: 0.1 },
  { name: "costPerUnit", label: "Cost per Unit", type: "number", placeholder: "0.00", min: 0, step: 0.01 },
];

export const reservationFields: FieldConfig[] = [
  { name: "guestName", label: "Guest Name", type: "text", placeholder: "Guest name", required: true },
  { name: "guestPhone", label: "Phone", type: "tel", placeholder: "+1 555-0000" },
  { name: "guestEmail", label: "Email", type: "email", placeholder: "guest@email.com" },
  { name: "guestCount", label: "Guest Count", type: "number", placeholder: "2", required: true, min: 1 },
  { name: "dateTime", label: "Date & Time", type: "date", required: true },
  { name: "duration", label: "Duration (min)", type: "number", placeholder: "120", min: 30 },
  { name: "tableId", label: "Table", type: "select", options: [] },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Special requests..." },
];
