import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
  }[];
  showSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  getRowId?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  actions,
  showSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId,
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange || !getRowId) return;
    if (checked) {
      onSelectionChange(new Set(data.map(getRowId)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    onSelectionChange(newSelected);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showSelection && (
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRows.size === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
                data-testid="checkbox-select-all"
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead key={String(column.accessorKey)}>{column.header}</TableHead>
          ))}
          {actions && <TableHead className="w-12"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (showSelection ? 1 : 0) + (actions ? 1 : 0)}
              className="text-center text-muted-foreground py-8"
            >
              No data available
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, idx) => {
            const rowId = getRowId?.(row) || String(idx);
            return (
              <TableRow
                key={rowId}
                className={onRowClick ? "cursor-pointer hover-elevate" : ""}
                onClick={() => onRowClick?.(row)}
                data-testid={`table-row-${rowId}`}
              >
                {showSelection && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(rowId)}
                      onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                      data-testid={`checkbox-row-${rowId}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.accessorKey)}>
                    {column.cell
                      ? column.cell(row[column.accessorKey], row)
                      : String(row[column.accessorKey])}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${rowId}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action) => (
                          <DropdownMenuItem
                            key={action.label}
                            onClick={() => action.onClick(row)}
                            data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
