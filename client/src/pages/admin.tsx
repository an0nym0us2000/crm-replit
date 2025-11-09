import { DataTable, Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  status: "active" | "inactive";
  lastLogin: string;
};

const roleConfig = {
  admin: { label: "Admin", variant: "default" as const },
  manager: { label: "Manager", variant: "secondary" as const },
  employee: { label: "Employee", variant: "secondary" as const },
};

export default function Admin() {
  const mockUsers: User[] = [
    { id: "1", name: "Admin User", email: "admin@company.com", role: "admin", status: "active", lastLogin: "2 hours ago" },
    { id: "2", name: "John Doe", email: "john.doe@company.com", role: "manager", status: "active", lastLogin: "1 day ago" },
    { id: "3", name: "Sarah Smith", email: "sarah.smith@company.com", role: "manager", status: "active", lastLogin: "3 hours ago" },
    { id: "4", name: "Mike Johnson", email: "mike.johnson@company.com", role: "employee", status: "active", lastLogin: "5 hours ago" },
    { id: "5", name: "Emily Davis", email: "emily.davis@company.com", role: "employee", status: "inactive", lastLogin: "1 week ago" },
  ];

  const userColumns: Column<User>[] = [
    {
      header: "User",
      accessorKey: "name",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={value} />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (value, row) => (
        <Select
          value={value}
          onValueChange={(newRole) => console.log("Change role:", row.id, newRole)}
        >
          <SelectTrigger className="w-[130px]" data-testid={`select-role-${row.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { header: "Last Login", accessorKey: "lastLogin" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users and system permissions</p>
        </div>
        <Button data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <DataTable
        data={mockUsers}
        columns={userColumns}
        onRowClick={(row) => console.log("Row clicked:", row)}
        actions={[
          { label: "Edit Permissions", onClick: (row) => console.log("Edit permissions:", row) },
          { label: "Deactivate", onClick: (row) => console.log("Deactivate:", row) },
          { label: "Delete", onClick: (row) => console.log("Delete:", row) },
        ]}
      />
    </div>
  );
}
