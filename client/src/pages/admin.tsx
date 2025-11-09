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
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

type DisplayUser = {
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
  const { data: users, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const displayUsers: DisplayUser[] = users?.map(user => ({
    id: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
    email: user.email || "",
    role: user.role,
    status: user.status,
    lastLogin: "Recently",
  })) || [];

  const userColumns: Column<DisplayUser>[] = [
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

      {usersLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : displayUsers.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>No users found.</p>
        </div>
      ) : (
        <DataTable
          data={displayUsers}
          columns={userColumns}
          onRowClick={(row) => console.log("Row clicked:", row)}
          actions={[
            { label: "Edit Permissions", onClick: (row) => console.log("Edit permissions:", row) },
            { label: "Deactivate", onClick: (row) => console.log("Deactivate:", row) },
            { label: "Delete", onClick: (row) => console.log("Delete:", row) },
          ]}
        />
      )}
    </div>
  );
}
