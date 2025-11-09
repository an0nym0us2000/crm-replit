import { MetricCard } from "@/components/metric-card";
import { ActivityCard } from "@/components/activity-card";
import { KanbanBoard } from "@/components/kanban-board";
import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const mockDeals = [
    { id: "1", title: "Enterprise Deal", company: "Acme Corp", assignee: "John Doe", value: "50K", dueDate: "Dec 15", stage: "lead" as const },
    { id: "2", title: "SaaS Subscription", company: "TechStart", assignee: "Sarah Smith", value: "25K", dueDate: "Dec 20", stage: "lead" as const },
    { id: "3", title: "Consulting Project", company: "InnovateCo", assignee: "Mike Johnson", value: "75K", dueDate: "Jan 5", stage: "negotiation" as const },
    { id: "4", title: "Marketing Campaign", company: "BrandX", assignee: "Emily Davis", value: "30K", dueDate: "Dec 18", stage: "negotiation" as const },
    { id: "5", title: "Product License", company: "GlobalTech", assignee: "Alex Chen", value: "100K", dueDate: "Dec 10", stage: "closed" as const },
    { id: "6", title: "Training Package", company: "SkillUp", assignee: "Lisa Wang", value: "15K", dueDate: "Dec 12", stage: "closed" as const },
  ];

  const mockActivities = [
    { id: "1", user: "Sarah Smith", action: "added a new lead", timestamp: "2 minutes ago" },
    { id: "2", user: "John Doe", action: "closed a deal with Acme Corp", timestamp: "15 minutes ago" },
    { id: "3", user: "Mike Johnson", action: "updated task status", timestamp: "1 hour ago" },
    { id: "4", user: "Emily Davis", action: "assigned new task to team", timestamp: "2 hours ago" },
    { id: "5", user: "Alex Chen", action: "completed project review", timestamp: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your company metrics and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={234}
          trend={{ value: "+12%", isPositive: true }}
          icon={Users}
        />
        <MetricCard
          title="Active Deals"
          value={48}
          trend={{ value: "+8%", isPositive: true }}
          icon={Briefcase}
        />
        <MetricCard
          title="Revenue"
          value="$125K"
          trend={{ value: "-3%", isPositive: false }}
          icon={DollarSign}
        />
        <MetricCard
          title="Conversion Rate"
          value="24%"
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
            <KanbanBoard
              deals={mockDeals}
              onCardClick={(id) => console.log("Card clicked:", id)}
              onAddCard={(stage) => console.log("Add card to:", stage)}
            />
          </CardContent>
        </Card>

        <ActivityCard
          title="Recent Activity"
          activities={mockActivities}
          onViewAll={() => console.log("View all clicked")}
        />
      </div>
    </div>
  );
}
