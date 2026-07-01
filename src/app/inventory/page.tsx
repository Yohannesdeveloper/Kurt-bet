"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Package, AlertTriangle, TrendingDown, Inbox, X } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

const categoryOptions = ["Vegetables", "Meat", "Spices", "Dairy", "Grains", "Beverages", "Other"];
const unitOptions = ["kg", "g", "L", "mL", "pcs", "dozen", "sack", "bottle"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");

  const resetForm = () => {
    setItemId("");
    setName("");
    setQuantity("");
    setUnit("");
    setCategory("");
  };

  const handleSubmit = () => {
    if (!itemId.trim() || !name.trim() || !quantity || !unit || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    if (items.some((i) => i.id === itemId.trim())) {
      toast.error("Item ID already exists");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      toast.error("Quantity must be a valid positive number");
      return;
    }
    const newItem: InventoryItem = {
      id: itemId.trim(),
      name: name.trim(),
      quantity: qty,
      unit,
      category,
    };
    setItems((prev) => [newItem, ...prev]);
    toast.success("Inventory item added");
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed");
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = items.length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 shadow-lg">
            <Package className="h-5 w-5 lg:h-6 lg:w-6 text-[#C89B3C]" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-sm text-muted-foreground">Track stock levels</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64"
            />
          </div>
          <Button
            variant="premium"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="h-10 lg:h-11 flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Items", value: totalValue.toString(), icon: Package, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
          { label: "Categories", value: new Set(items.map(i => i.category)).size.toString(), icon: Package, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/10", iconColor: "text-purple-600" },
          { label: "Low Stock", value: items.filter(i => i.quantity < 10).toString(), icon: AlertTriangle, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
          { label: "Total Value", value: items.length.toString(), icon: TrendingDown, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-[#C89B3C]/20">
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

      {filtered.length === 0 ? (
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
                Add your first item to start tracking stock.
              </p>
              <Button
                variant="premium"
                className="h-11"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Item ID</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Unit</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Category</th>
                      <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-mono text-[#C89B3C] font-medium">{item.id}</td>
                        <td className="p-4 text-sm font-medium">{item.name}</td>
                        <td className="p-4 text-sm">{item.quantity}</td>
                        <td className="p-4 text-sm text-muted-foreground">{item.unit}</td>
                        <td className="p-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C89B3C]/10 text-[#C89B3C]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Fill in the item details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="itemId">Item ID</Label>
              <Input
                id="itemId"
                placeholder="e.g. ITM-001"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="premium" onClick={handleSubmit}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
