import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { TaskFilters } from "@/components/task-filters";
import { PriorityBadge } from "@/components/priority-badge";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { Checkbox } from "@/components/ui/checkbox";

type Task = {
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

  const mockTasks: Task[] = [
    { id: "1", title: "Review Q4 Sales Report", description: "Analyze quarterly performance", priority: "high", status: "in-progress", assignedTo: "John Doe", dueDate: "Dec 15, 2024", completed: false },
    { id: "2", title: "Update CRM Database", description: "Import new client records", priority: "medium", status: "todo", assignedTo: "Sarah Smith", dueDate: "Dec 20, 2024", completed: false },
    { id: "3", title: "Prepare Marketing Materials", description: "Design new campaign assets", priority: "low", status: "done", assignedTo: "Mike Johnson", dueDate: "Dec 10, 2024", completed: true },
    { id: "4", title: "Client Follow-up Call", description: "Schedule meeting with Acme Corp", priority: "high", status: "todo", assignedTo: "Emily Davis", dueDate: "Dec 12, 2024", completed: false },
    { id: "5", title: "Team Performance Review", description: "Conduct quarterly assessments", priority: "medium", status: "in-progress", assignedTo: "Alex Chen", dueDate: "Dec 18, 2024", completed: false },
  ];

  const taskColumns: Column<Task>[] = [
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
      cell: (value: Task["status"]) => <Badge variant={statusConfig[value].variant}>{statusConfig[value].label}</Badge>,
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

      <TaskFilters
        onSearch={(q) => console.log("Search:", q)}
        onFilterStatus={(s) => console.log("Filter status:", s)}
        onFilterPriority={(p) => console.log("Filter priority:", p)}
        onAddTask={() => console.log("Add task")}
      />

      <DataTable
        data={mockTasks}
        columns={taskColumns}
        onRowClick={(row) => console.log("Row clicked:", row)}
        actions={[
          { label: "Edit", onClick: (row) => console.log("Edit:", row) },
          { label: "Delete", onClick: (row) => console.log("Delete:", row) },
          { label: "Assign", onClick: (row) => console.log("Assign:", row) },
        ]}
        showSelection
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
