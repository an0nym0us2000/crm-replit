import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "./user-avatar";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";

interface EmployeeCardProps {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  email: string;
  phone: string;
  performanceScore?: number;
  onClick?: () => void;
}

export function EmployeeCard({
  id,
  name,
  role,
  department,
  status,
  email,
  phone,
  performanceScore,
  onClick,
}: EmployeeCardProps) {
  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`employee-card-${id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <UserAvatar name={name} className="h-12 w-12" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{name}</h3>
                <p className="text-sm text-muted-foreground truncate">{role}</p>
              </div>
              <StatusBadge status={status} />
            </div>
            <Badge variant="secondary" className="mb-3">{department}</Badge>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
            </div>
            {performanceScore !== undefined && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{performanceScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
