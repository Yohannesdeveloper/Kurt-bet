"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, UserCheck, UserMinus, Inbox } from "lucide-react";
import { CrudFormDialog } from "@/components/shared/crud-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { employeeFields } from "@/components/forms/field-configs";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

const roleOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "Waiter", value: "WAITER" },
  { label: "Kitchen", value: "KITCHEN" },
  { label: "Client", value: "CLIENT" },
];

export default function EmployeesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const handleCreate = async (values: Record<string, unknown>) => {
    const newEmployee: Employee = {
      id: `e${Date.now()}`,
      firstName: values.firstName as string,
      lastName: values.lastName as string,
      email: values.email as string,
      phone: (values.phone as string) || "",
      role: (values.roleId as string) || "WAITER",
      isActive: true,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    toast.success("Employee added");
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editingEmployee) return;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === editingEmployee.id
          ? {
              ...e,
              firstName: values.firstName as string,
              lastName: values.lastName as string,
              email: values.email as string,
              phone: (values.phone as string) || "",
            }
          : e
      )
    );
    toast.success("Employee updated");
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    setEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id));
    toast.success("Employee removed");
    setDeleteDialogOpen(false);
    setDeletingEmployee(null);
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
            <Users className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Employees</h1>
            <p className="text-sm text-muted-foreground">Manage your team</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 lg:h-11 w-full sm:w-64 transition-all duration-200 focus:w-72"
            />
          </div>
          {isAdmin && (
            <Button
              variant="premium"
              onClick={() => {
                setEditingEmployee(null);
                setDialogOpen(true);
              }}
              className="h-10 lg:h-11 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Employee
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: "Total", value: "0", icon: Users, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
          { label: "Active", value: "0", icon: UserCheck, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
          { label: "Inactive", value: "0", icon: UserMinus, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
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
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first employee to start building your team.
            </p>
            {isAdmin && (
              <Button variant="premium" className="h-11">
                <Plus className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        fields={employeeFields.map((f) =>
          f.name === "roleId" ? { ...f, options: roleOptions } : f
        )}
        defaultValues={
          editingEmployee
            ? {
                firstName: editingEmployee.firstName,
                lastName: editingEmployee.lastName,
                email: editingEmployee.email,
                phone: editingEmployee.phone,
              }
            : undefined
        }
        onSubmit={editingEmployee ? handleEdit : handleCreate}
        mode={editingEmployee ? "edit" : "create"}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Employee"
        description={`Remove ${deletingEmployee?.firstName} ${deletingEmployee?.lastName}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
