import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, trend, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={className} data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.value}
            </span>
            <span className="text-muted-foreground">this week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
