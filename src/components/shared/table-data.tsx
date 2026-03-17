import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Upload,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Action<T> {
  label: string | ((item: T) => string);
  icon?: React.ReactNode | ((item: T) => React.ReactNode);
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "success" | ((item: T) => string);
  show?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  title?: string;
  description?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  actions?: Action<T>[];
  searchPlaceholder?: string;
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  renderExpanded?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  selectedRows?: string[];
  onRowSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  enableRowSelection?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  title,
  description,
  onAdd,
  onRefresh,
  onExport,
  onImport,
  actions = [],
  searchPlaceholder = "Search...",
  showPagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  className,
  renderExpanded,
  onRowClick,
  onRowSelect,
  onSelectAll,
  enableRowSelection = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const toggleRowExpanded = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {title && <Skeleton className="h-8 w-48" />}
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || onAdd || onExport || onImport) && (
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>
            )}
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9"
          />
        </div>
        {showPagination && (
          <div className="flex items-center gap-2">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {renderExpanded && (
                  <TableHead className="w-10">
                    <span className="sr-only">Expand</span>
                  </TableHead>
                )}
                {enableRowSelection && (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={table.getIsAllRowsSelected()}
                      onChange={(e) => {
                        table.toggleAllRowsSelected(e.target.checked);
                        onSelectAll?.(e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ArrowUpDown className="h-4 w-4" />,
                          desc: <ArrowUpDown className="h-4 w-4 rotate-180" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
                {(actions.length > 0 || onRowClick) && (
                  <TableHead className="w-20">Actions</TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    expandedRows.has(row.id) && "bg-muted/50",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {renderExpanded && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpanded(row.id);
                        }}
                      >
                        {expandedRows.has(row.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {enableRowSelection && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => {
                          row.toggleSelected(e.target.checked);
                          onRowSelect?.(row.original.id, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  {(actions.length > 0 || onRowClick) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions.map((action, index) => {
                            if (action.show && !action.show(row.original))
                              return null;

                            const label =
                              typeof action.label === "function"
                                ? action.label(row.original)
                                : action.label;

                            const icon =
                              typeof action.icon === "function"
                                ? action.icon(row.original)
                                : action.icon;

                            const variant =
                              typeof action.variant === "function"
                                ? action.variant(row.original)
                                : action.variant;

                            return (
                              <DropdownMenuItem
                                key={index}
                                onSelect={(e) => {
                                  // Radix DropdownMenuItem fires onSelect reliably; onClick can be inconsistent
                                  e.preventDefault();
                                  action.onClick(row.original);
                                }}
                                className={cn(
                                  variant === "destructive" &&
                                    "text-destructive focus:text-destructive",
                                  variant === "success" &&
                                    "text-green-600 focus:text-green-600",
                                )}
                              >
                                {icon}
                                <span className="ml-2">{label}</span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (renderExpanded ? 1 : 0) +
                    (enableRowSelection ? 1 : 0) +
                    (actions.length > 0 || onRowClick ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} • Total{" "}
            {table.getFilteredRowModel().rows.length} records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
