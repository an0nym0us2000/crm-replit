import { MetricCard } from "../metric-card";
import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-8">
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
    </div>
  );
}
