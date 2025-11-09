import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UserAvatar } from "./user-avatar";

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
  onViewAll?: () => void;
}

export function ActivityCard({ title, activities, onViewAll }: ActivityCardProps) {
  return (
    <Card data-testid={`activity-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAll}
          data-testid="button-view-all-activity"
        >
          View All
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-${activity.id}`}>
            <UserAvatar name={activity.user} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
