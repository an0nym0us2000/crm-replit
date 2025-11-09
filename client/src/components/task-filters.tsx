import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";

interface TaskFiltersProps {
  onSearch?: (query: string) => void;
  onFilterStatus?: (status: string) => void;
  onFilterPriority?: (priority: string) => void;
  onAddTask?: () => void;
}

export function TaskFilters({
  onSearch,
  onFilterStatus,
  onFilterPriority,
  onAddTask,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9"
          onChange={(e) => onSearch?.(e.target.value)}
          data-testid="input-search-tasks"
        />
      </div>
      
      <div className="flex gap-2 items-center flex-wrap">
        <Select onValueChange={onFilterStatus}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onFilterPriority}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-priority">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddTask} data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
