import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";

interface Deal {
  id: string;
  title: string;
  company: string;
  assignee: string;
  value: string;
  dueDate: string;
  stage: "lead" | "negotiation" | "closed";
}

interface KanbanBoardProps {
  deals: Deal[];
  onCardClick?: (dealId: string) => void;
  onAddCard?: (stage: string) => void;
}

export function KanbanBoard({ deals, onCardClick, onAddCard }: KanbanBoardProps) {
  const leadDeals = deals.filter((d) => d.stage === "lead");
  const negotiationDeals = deals.filter((d) => d.stage === "negotiation");
  const closedDeals = deals.filter((d) => d.stage === "closed");

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" data-testid="kanban-board">
      <KanbanColumn 
        title="Lead" 
        count={leadDeals.length}
        onAddCard={() => onAddCard?.("lead")}
      >
        {leadDeals.map((deal) => (
          <KanbanCard
            key={deal.id}
            {...deal}
            onClick={() => onCardClick?.(deal.id)}
          />
        ))}
      </KanbanColumn>

      <KanbanColumn 
        title="Negotiation" 
        count={negotiationDeals.length}
        onAddCard={() => onAddCard?.("negotiation")}
      >
        {negotiationDeals.map((deal) => (
          <KanbanCard
            key={deal.id}
            {...deal}
            onClick={() => onCardClick?.(deal.id)}
          />
        ))}
      </KanbanColumn>

      <KanbanColumn 
        title="Closed" 
        count={closedDeals.length}
        onAddCard={() => onAddCard?.("closed")}
      >
        {closedDeals.map((deal) => (
          <KanbanCard
            key={deal.id}
            {...deal}
            onClick={() => onCardClick?.(deal.id)}
          />
        ))}
      </KanbanColumn>
    </div>
  );
}
