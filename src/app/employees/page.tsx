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
import { Search, Plus, Users, UserCheck, UserMinus, Inbox, X } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Employee {
  id: string;
  name: string;
  fatherName: string;
  age: number;
  position: string;
}

const positionOptions = [
  "Chef",
  "Waitress",
  "Waiter",
  "Kitchen Staff",
  "Manager",
  "Cashier",
  "Bartender",
  "Host",
  "Cleaner",
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("");

  const resetForm = () => {
    setName("");
    setFatherName("");
    setAge("");
    setPosition("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !fatherName.trim() || !age || !position) {
      toast.error("Please fill in all fields");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error("Age must be between 18 and 100");
      return;
    }
    const newEmployee: Employee = {
      id: `e${Date.now()}`,
      name: name.trim(),
      fatherName: fatherName.trim(),
      age: ageNum,
      position,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    toast.success("Employee added");
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    toast.success("Employee removed");
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C89B3C]/20 to-[#A12222]/20 shadow-lg">
            <Users className="h-5 w-5 lg:h-6 lg:w-6 text-[#C89B3C]" />
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
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: "Total", value: employees.length.toString(), icon: Users, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-500/10", iconColor: "text-blue-600" },
          { label: "Active", value: employees.length.toString(), icon: UserCheck, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", iconColor: "text-emerald-600" },
          { label: "Positions", value: new Set(employees.map(e => e.position)).size.toString(), icon: UserMinus, color: "from-red-500 to-rose-600", bgColor: "bg-red-500/10", iconColor: "text-red-600" },
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
              <Button
                variant="premium"
                className="h-11"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Father&apos;s Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Age</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Position</th>
                      <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{emp.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{emp.fatherName}</td>
                        <td className="p-4 text-sm">{emp.age}</td>
                        <td className="p-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C89B3C]/10 text-[#C89B3C]">
                            {emp.position}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(emp.id)}
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
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Fill in the employee details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fatherName">Father&apos;s Name</Label>
              <Input
                id="fatherName"
                placeholder="Enter father's name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={100}
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
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
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
