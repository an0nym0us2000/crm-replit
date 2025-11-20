import { useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { ActivityCard } from "@/components/activity-card";
import { KanbanBoard } from "@/components/kanban-board";
import { DealFormDialog } from "@/components/deal-form-dialog";
import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Deal, User, Lead, Activity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";

type ActivityWithUser = Activity & {
  userName: string;
  userEmail: string;
  targetUserName?: string;
  targetUserEmail?: string;
};

export default function Dashboard() {
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<"lead" | "negotiation" | "closed">("lead");

  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/activities"],
  });

  const formattedActivities = activities?.map(activity => ({
    id: activity.id,
    user: activity.userName,
    action: activity.description,
    timestamp: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
  })) || [];

  const getUserName = (userId: string | null) => {
    if (!userId || !users) return "Unassigned";
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown" : "Unknown";
  };

  const transformedDeals = deals?.map(deal => ({
    id: deal.id,
    title: deal.title,
    company: deal.company,
    assignee: getUserName(deal.assignedTo),
    value: `$${(deal.value / 1000).toFixed(0)}K`,
    dueDate: deal.dueDate ? format(new Date(deal.dueDate), "MMM d") : "No date",
    stage: deal.stage,
  })) || [];

  const activeDeals = deals?.filter(d => d.stage !== "closed").length || 0;
  const totalRevenue = deals?.filter(d => d.stage === "closed").reduce((sum, d) => sum + d.value, 0) || 0;
  const conversionRate = (leads && deals) 
    ? leads.length > 0 
      ? Math.round((deals.filter(d => d.stage === "closed").length / leads.length) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your company metrics and activity</p>
      </div>

      <DealFormDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} defaultStage={selectedStage} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={leads?.length || 0}
          trend={{ value: "+12%", isPositive: true }}
          icon={Users}
        />
        <MetricCard
          title="Active Deals"
          value={activeDeals}
          trend={{ value: "+8%", isPositive: true }}
          icon={Briefcase}
        />
        <MetricCard
          title="Revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          trend={{ value: "-3%", isPositive: false }}
          icon={DollarSign}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          trend={{ value: "+5%", isPositive: true }}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : transformedDeals.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No deals yet. Add your first deal to get started.</p>
              </div>
            ) : (
              <KanbanBoard
                deals={transformedDeals}
                onCardClick={(id) => console.log("Card clicked:", id)}
                onAddCard={(stage) => {
                  setSelectedStage(stage as "lead" | "negotiation" | "closed");
                  setDealDialogOpen(true);
                }}
              />
            )}
          </CardContent>
        </Card>

        {activitiesLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <ActivityCard
            title="Recent Activity"
            activities={formattedActivities}
            onViewAll={() => console.log("View all clicked")}
          />
        )}
      </div>
    </div>
  );
}
