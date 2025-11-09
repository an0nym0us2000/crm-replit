import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter, Download } from "lucide-react";

interface CRMTableFiltersProps {
  onSearch?: (query: string) => void;
  onFilterStage?: (stage: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  addLabel?: string;
  placeholder?: string;
}

export function CRMTableFilters({
  onSearch,
  onFilterStage,
  onAdd,
  onExport,
  addLabel = "Add New",
  placeholder = "Search...",
}: CRMTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          onChange={(e) => onSearch?.(e.target.value)}
          data-testid="input-search"
        />
      </div>
      
      <div className="flex gap-2 items-center flex-wrap">
        <Select onValueChange={onFilterStage}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-stage">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {onExport && (
          <Button variant="outline" onClick={onExport} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        <Button onClick={onAdd} data-testid="button-add">
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
