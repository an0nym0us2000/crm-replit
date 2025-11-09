import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

type StatusType = "lead" | "negotiation" | "closed" | "active" | "inactive";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  lead: {
    label: "Lead",
    color: "bg-blue-500",
    variant: "secondary" as const,
  },
  negotiation: {
    label: "Negotiation",
    color: "bg-yellow-500",
    variant: "secondary" as const,
  },
  closed: {
    label: "Closed",
    color: "bg-green-500",
    variant: "secondary" as const,
  },
  active: {
    label: "Active",
    color: "bg-green-500",
    variant: "secondary" as const,
  },
  inactive: {
    label: "Inactive",
    color: "bg-gray-500",
    variant: "secondary" as const,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-status-${status}`}>
      <Circle className={`h-2 w-2 fill-current ${config.color} mr-1.5`} />
      {config.label}
    </Badge>
  );
}
