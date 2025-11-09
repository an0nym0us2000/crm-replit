import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { TaskFilters } from "@/components/task-filters";
import { PriorityBadge } from "@/components/priority-badge";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useQuery } from "@tanstack/react-query";
import type { Task as TaskType, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type DisplayTask = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  assignedTo: string;
  dueDate: string;
  completed: boolean;
};

const statusConfig = {
  todo: { label: "To Do", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  done: { label: "Done", variant: "secondary" as const },
};

export default function Tasks() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | undefined>(undefined);

  const { data: tasks, isLoading: tasksLoading } = useQuery<TaskType[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getUserName = (userId: string | null) => {
    if (!userId || !users) return "Unassigned";
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown" : "Unknown";
  };

  const displayTasks: DisplayTask[] = tasks?.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    status: task.status,
    assignedTo: getUserName(task.assignedTo),
    dueDate: task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date",
    completed: task.completed,
  })) || [];

  const taskColumns: Column<DisplayTask>[] = [
    {
      header: "",
      accessorKey: "completed",
      cell: (value, row) => (
        <Checkbox
          checked={value}
          onCheckedChange={(checked) => console.log("Task completed:", row.id, checked)}
          data-testid={`checkbox-task-${row.id}`}
        />
      ),
    },
    { header: "Title", accessorKey: "title" },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (value) => <PriorityBadge priority={value} />,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: DisplayTask["status"]) => <Badge variant={statusConfig[value].variant}>{statusConfig[value].label}</Badge>,
    },
    {
      header: "Assigned To",
      accessorKey: "assignedTo",
      cell: (value) => (
        <div className="flex items-center gap-2">
          <UserAvatar name={value} className="h-6 w-6" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    { header: "Due Date", accessorKey: "dueDate" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage team tasks and assignments</p>
      </div>

      <TaskFormDialog 
        open={taskDialogOpen} 
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(undefined);
        }}
        data={editingTask}
      />

      <TaskFilters
        onSearch={(q) => console.log("Search:", q)}
        onFilterStatus={(s) => console.log("Filter status:", s)}
        onFilterPriority={(p) => console.log("Filter priority:", p)}
        onAddTask={() => setTaskDialogOpen(true)}
      />

      {tasksLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>No tasks yet. Add your first task to get started.</p>
        </div>
      ) : (
        <DataTable
          data={displayTasks}
          columns={taskColumns}
          onRowClick={(row) => console.log("Row clicked:", row)}
          actions={[
            { 
              label: "Edit", 
              onClick: (row) => {
                const task = tasks?.find(t => t.id === row.id);
                if (task) {
                  setEditingTask(task);
                  setTaskDialogOpen(true);
                }
              } 
            },
            { label: "Delete", onClick: (row) => console.log("Delete:", row) },
            { label: "Assign", onClick: (row) => console.log("Assign:", row) },
          ]}
          showSelection
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
}
