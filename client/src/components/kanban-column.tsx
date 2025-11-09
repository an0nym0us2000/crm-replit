import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  title: string;
  count: number;
  children: React.ReactNode;
  onAddCard?: () => void;
}

export function KanbanColumn({ title, count, children, onAddCard }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px]" data-testid={`kanban-column-${title.toLowerCase()}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
      <Button 
        variant="ghost" 
        className="justify-start" 
        onClick={onAddCard}
        data-testid={`button-add-card-${title.toLowerCase()}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Card
      </Button>
    </div>
  );
}
