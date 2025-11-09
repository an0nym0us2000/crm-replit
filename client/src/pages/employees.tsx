import { useState } from "react";
import { EmployeeCard } from "@/components/employee-card";
import { CRMTableFilters } from "@/components/crm-table-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

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

export default function Employees() {
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const mockEmployees: Employee[] = [
    { id: "1", name: "John Doe", role: "Senior Developer", department: "Engineering", status: "active", email: "john.doe@company.com", phone: "+1 (555) 123-4567", performanceScore: 92 },
    { id: "2", name: "Sarah Smith", role: "Product Manager", department: "Product", status: "active", email: "sarah.smith@company.com", phone: "+1 (555) 234-5678", performanceScore: 88 },
    { id: "3", name: "Mike Johnson", role: "Sales Manager", department: "Sales", status: "active", email: "mike.johnson@company.com", phone: "+1 (555) 345-6789", performanceScore: 85 },
    { id: "4", name: "Emily Davis", role: "Marketing Director", department: "Marketing", status: "active", email: "emily.davis@company.com", phone: "+1 (555) 456-7890", performanceScore: 90 },
    { id: "5", name: "Alex Chen", role: "UX Designer", department: "Design", status: "inactive", email: "alex.chen@company.com", phone: "+1 (555) 567-8901", performanceScore: 78 },
    { id: "6", name: "Lisa Wang", role: "HR Manager", department: "HR", status: "active", email: "lisa.wang@company.com", phone: "+1 (555) 678-9012", performanceScore: 87 },
  ];

  const filteredEmployees = mockEmployees.filter(emp => {
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <CRMTableFilters
          placeholder="Search employees..."
          addLabel="Add Employee"
          onSearch={(q) => console.log("Search:", q)}
          onAdd={() => console.log("Add employee")}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            {...employee}
            onClick={() => console.log("Employee clicked:", employee.id)}
          />
        ))}
      </div>
    </div>
  );
}
