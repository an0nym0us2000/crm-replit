import { PriorityBadge } from "../priority-badge";

export default function PriorityBadgeExample() {
  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority="low" />
        <PriorityBadge priority="medium" />
        <PriorityBadge priority="high" />
      </div>
    </div>
  );
}
