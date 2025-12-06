import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Grades } from "../employee_settings/tables/grades-table";
import type { Scales } from "../employee_settings/tables/scales-table";
import ColumnsList from "./columns-list";
import { Filter } from "./filter";
import TableRowOptions from "./table-row-options";

export type Employee = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Date;
  phoneNo: string;
  email: string;
  tgHandle: string;
  position: string;
  department: string;
  levelOfEdu: string;
  fieldOfStudy: string;
  grade: Grades;
  scale: Scales;
  experience: string;
  empType: string;
  annualLeave: number;
  temporaryLeave: number;
};

interface EmployeesTableProps {
  data: Employee[];
  rowSelection: RowSelectionState;
  setRowSelection: OnChangeFn<RowSelectionState>;
}

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}

export function EmployeesTable({
  data,
  rowSelection,
  setRowSelection,
}: EmployeesTableProps) {
  const columns = React.useMemo<ColumnDef<Employee, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>First name</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("firstName")}</div>
        ),
      },
      {
        accessorKey: "middleName",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Middle name</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("middleName")}</div>
        ),
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Last name</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("lastName")}</div>
        ),
      },
      {
        accessorKey: "dob",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Date of Birth</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const d = new Date(row.getValue("dob"));
          const formattedDate = d.toISOString().split("T")[0];
          return <div className="font-medium">{formattedDate}</div>;
        },
      },
      {
        accessorKey: "phoneNo",
        header: ({ column }) => (
          <Button className="!px-0" variant="ghost">
            <div>Phone number</div>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right w-16">{row.getValue("phoneNo")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Email</div>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right w-18 mr-10">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "tgHandle",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>TG Handle </span> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="truncate max-w-xs">{row.getValue("tgHandle")}</div>
        ),
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Position </span> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("position")}</div>,
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "department",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Department </span> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("department")}</div>,
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "levelOfEdu",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Level of EDU</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("levelOfEdu")}</div>,
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "fieldOfStudy",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Field of Study</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("fieldOfStudy")}</div>,
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "experience",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Experience</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("experience")}</div>,
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "grade",
        accessorFn: (row) => row.grade.name,
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Grade</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const grade = row.original.grade;
          return <div>{grade.name}</div>;
        },
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "scale",
        accessorFn: (row) => row.scale.name,
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Scale</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const scale = row.original.scale;
          return <div>{scale.name}</div>;
        },
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "annualLeave",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Annual Leave</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("annualLeave")}</div>,
        meta: {
          filterVariant: "range",
        },
      },
      {
        accessorKey: "temporaryLeave",
        header: ({ column }) => (
          <Button
            className="!px-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div>Temp Leave</div> <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("temporaryLeave")}</div>,
        meta: {
          filterVariant: "range",
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const position = row.original;
          return <TableRowOptions position={position} />;
        },
      },
    ],
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      experience: false,
      annualLeave: false,
      temporaryLeave: false,
      fieldOfStudy: false,
      levelOfEdu: false,
      scale: false,
      grade: false,
    });

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <ColumnsList table={table} />
      </div>
      <div className="overflow-hidden rounded-md border ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} />
                        </div>
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
