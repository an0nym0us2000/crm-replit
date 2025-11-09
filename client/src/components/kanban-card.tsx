import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "./user-avatar";
import { Calendar, DollarSign } from "lucide-react";

interface KanbanCardProps {
  id: string;
  title: string;
  company: string;
  assignee: string;
  value: string;
  dueDate: string;
  onClick?: () => void;
}

export function KanbanCard({ id, title, company, assignee, value, dueDate, onClick }: KanbanCardProps) {
  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`kanban-card-${id}`}
    >
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{company}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar name={assignee} className="h-6 w-6" />
            <span className="text-xs text-muted-foreground">{assignee.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium">
            <DollarSign className="h-3 w-3" />
            {value}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {dueDate}
        </div>
      </CardContent>
    </Card>
  );
}
