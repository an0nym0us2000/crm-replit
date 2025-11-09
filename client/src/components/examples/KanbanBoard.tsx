import { KanbanBoard } from "../kanban-board";

const mockDeals = [
  { id: "1", title: "Enterprise Deal", company: "Acme Corp", assignee: "John Doe", value: "50K", dueDate: "Dec 15", stage: "lead" as const },
  { id: "2", title: "SaaS Subscription", company: "TechStart", assignee: "Sarah Smith", value: "25K", dueDate: "Dec 20", stage: "lead" as const },
  { id: "3", title: "Consulting Project", company: "InnovateCo", assignee: "Mike Johnson", value: "75K", dueDate: "Jan 5", stage: "negotiation" as const },
  { id: "4", title: "Marketing Campaign", company: "BrandX", assignee: "Emily Davis", value: "30K", dueDate: "Dec 18", stage: "negotiation" as const },
  { id: "5", title: "Product License", company: "GlobalTech", assignee: "Alex Chen", value: "100K", dueDate: "Dec 10", stage: "closed" as const },
  { id: "6", title: "Training Package", company: "SkillUp", assignee: "Lisa Wang", value: "15K", dueDate: "Dec 12", stage: "closed" as const },
];

export default function KanbanBoardExample() {
  return (
    <div className="p-8">
      <KanbanBoard
        deals={mockDeals}
        onCardClick={(id) => console.log("Card clicked:", id)}
        onAddCard={(stage) => console.log("Add card to:", stage)}
      />
    </div>
  );
}
