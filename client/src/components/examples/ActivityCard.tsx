import { ActivityCard } from "../activity-card";

const mockActivities = [
  { id: "1", user: "Sarah Smith", action: "added a new lead", timestamp: "2 minutes ago" },
  { id: "2", user: "John Doe", action: "closed a deal with Acme Corp", timestamp: "15 minutes ago" },
  { id: "3", user: "Mike Johnson", action: "updated task status", timestamp: "1 hour ago" },
  { id: "4", user: "Emily Davis", action: "assigned new task to team", timestamp: "2 hours ago" },
  { id: "5", user: "Alex Chen", action: "completed project review", timestamp: "3 hours ago" },
];

export default function ActivityCardExample() {
  return (
    <div className="p-8 max-w-md">
      <ActivityCard
        title="Recent Activity"
        activities={mockActivities}
        onViewAll={() => console.log("View all clicked")}
      />
    </div>
  );
}
