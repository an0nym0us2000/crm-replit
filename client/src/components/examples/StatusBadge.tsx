import { StatusBadge } from "../status-badge";

export default function StatusBadgeExample() {
  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="lead" />
        <StatusBadge status="negotiation" />
        <StatusBadge status="closed" />
        <StatusBadge status="active" />
        <StatusBadge status="inactive" />
      </div>
    </div>
  );
}
