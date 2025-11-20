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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status updated",
        description: "User status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
          onValueChange={(newRole) => updateRoleMutation.mutate({ userId: row.id, role: newRole })}
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
            {
              label: row => row.status === "active" ? "Deactivate" : "Activate",
              onClick: (row) => updateStatusMutation.mutate({
                userId: row.id,
                status: row.status === "active" ? "inactive" : "active"
              })
            },
            {
              label: "Delete User",
              onClick: (row) => {
                if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                  deleteUserMutation.mutate(row.id);
                }
              }
            },
          ]}
        />
      )}
    </div>
  );
}
