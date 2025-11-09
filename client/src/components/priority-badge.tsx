import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

type PriorityType = "low" | "medium" | "high";

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-gray-500",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500",
  },
  high: {
    label: "High",
    color: "bg-red-500",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="secondary" className={className} data-testid={`badge-priority-${priority}`}>
      <Circle className={`h-2 w-2 fill-current ${config.color} mr-1.5`} />
      {config.label}
    </Badge>
  );
}
