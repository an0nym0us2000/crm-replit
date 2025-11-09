import { useState } from "react";
import { EmployeeCard } from "@/components/employee-card";
import { CRMTableFilters } from "@/components/crm-table-filters";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  email: string;
  phone: string;
  performanceScore: number;
};

const roleToDepartment: Record<string, string> = {
  admin: "Administration",
  manager: "Management",
  employee: "General",
};

export default function Employees() {
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const displayEmployees: Employee[] = users?.map(user => ({
    id: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    department: roleToDepartment[user.role] || "General",
    status: user.status,
    email: user.email || "",
    phone: "+1 (555) 000-0000",
    performanceScore: Math.floor(Math.random() * 30) + 70,
  })) || [];

  const filteredEmployees = displayEmployees.filter(emp => {
    if (filterDepartment !== "all" && emp.department !== filterDepartment) return false;
    if (filterStatus !== "all" && emp.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Employee Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team members and track their performance
        </p>
      </div>

      <EmployeeFormDialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen} />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <CRMTableFilters
          placeholder="Search employees..."
          addLabel="Add Employee"
          onSearch={(q) => console.log("Search:", q)}
          onAdd={() => setEmployeeDialogOpen(true)}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-department">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {usersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>No employees found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              {...employee}
              onClick={() => console.log("Employee clicked:", employee.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
