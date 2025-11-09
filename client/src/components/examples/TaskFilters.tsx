import { TaskFilters } from "../task-filters";

export default function TaskFiltersExample() {
  return (
    <div className="p-8">
      <TaskFilters
        onSearch={(q) => console.log("Search:", q)}
        onFilterStatus={(s) => console.log("Filter status:", s)}
        onFilterPriority={(p) => console.log("Filter priority:", p)}
        onAddTask={() => console.log("Add task clicked")}
      />
    </div>
  );
}
