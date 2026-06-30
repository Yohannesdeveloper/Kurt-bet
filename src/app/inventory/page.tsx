"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, AlertTriangle, TrendingDown, Inbox } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CrudFormDialog } from "@/components/shared/crud-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { inventoryFields } from "@/components/forms/field-configs";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const handleCreate = async (values: Record<string, unknown>) => {
    const newItem: InventoryItem = {
      id: `i${Date.now()}`,
      name: values.name as string,
      sku: values.sku as string,
      category: values.category as string,
      unit: values.unit as string,
      currentStock: values.currentStock as number,
      minStock: values.minStock as number,
      maxStock: values.maxStock as number,
      costPerUnit: values.costPerUnit as number,
    };
    setItems((prev) => [...prev, newItem]);
    toast.success("Inventory item created");
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id ? ({ ...i, ...values } as InventoryItem) : i
      )
    );
    toast.success("Inventory item updated");
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
    toast.success("Inventory item deleted");
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
            <Package className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">
              Track stock levels, manage suppliers, reduce waste
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
            />
          </div>
          {isAdmin && (
            <Button
              variant="premium"
              onClick={() => {
                setEditingItem(null);
                setDialogOpen(true);
              }}
              className="h-10 lg:h-11 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Items", value: "0", icon: Package, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
          { label: "Low Stock Items", value: "0", icon: AlertTriangle, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
          { label: "Total Value", value: formatCurrency(0), icon: TrendingDown, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
          { label: "Categories", value: "0", icon: Package, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No inventory items yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first inventory item to start tracking stock levels.
            </p>
            {isAdmin && (
              <Button variant="premium" className="h-11">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
        fields={inventoryFields}
        defaultValues={
          editingItem
            ? {
                name: editingItem.name,
                sku: editingItem.sku,
                category: editingItem.category,
                unit: editingItem.unit,
                currentStock: editingItem.currentStock,
                minStock: editingItem.minStock,
                maxStock: editingItem.maxStock,
                costPerUnit: editingItem.costPerUnit,
              }
            : undefined
        }
        onSubmit={editingItem ? handleEdit : handleCreate}
        mode={editingItem ? "edit" : "create"}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Inventory Item"
        description={`Delete "${deletingItem?.name}"? This can be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
