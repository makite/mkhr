import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data: Employees[] = [
  {
    id: "select",
    firstName: "Selomon",
    middleName: "Abebe",
    lastName: "Haile",
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@sola_19",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "BSc",
    fieldOfStudy: "CS",
    experience: "1",
    empType: "permanent",
    annualLeave: 16,
    temporaryLeave: 0,
  },
  {
    id: "select",
    firstName: "Berekt",
    middleName: "Weldegiorgis",
    lastName: "Tasew",
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@bekie21",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "BSc",
    fieldOfStudy: "SWE",
    experience: "2",
    empType: "permanent",
    annualLeave: 10,
    temporaryLeave: 2,
  },
  {
    id: "select",
    firstName: "Bezawit",
    middleName: "Tibebu",
    lastName: "Alemu",
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@bezbeza",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "MSc",
    fieldOfStudy: "CS",
    experience: "5",
    empType: "temporary",
    annualLeave: 0,
    temporaryLeave: 0,
  },
];

export type Employees = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNo: string;
  email: string;
  tgHandle: string;
  position: string;
  department: string;
  levelOfEdu: string;
  fieldOfStudy: string;
  experience: string;
  empType: string;
  annualLeave: number;
  temporaryLeave: number;
};

const columns: ColumnDef<Employees>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "phoneNo",
    header: ({ column }) => (
      <Button
        className="!px-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
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
    header: "TG Handle",
    cell: ({ row }) => (
      <div className="truncate max-w-xs">{row.getValue("tgHandle")}</div>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => <div>{row.getValue("position")}</div>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <div>{row.getValue("department")}</div>,
  },
  {
    accessorKey: "levelOfEdu",
    header: "Level of EDU",
    cell: ({ row }) => <div>{row.getValue("levelOfEdu")}</div>,
  },
  {
    accessorKey: "fieldOfStudy",
    header: "Field of Study",
    cell: ({ row }) => <div>{row.getValue("fieldOfStudy")}</div>,
  },
  {
    id: "experience",
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }) => <div>{row.getValue("experience")}</div>,
  },
  {
    accessorKey: "annualLeave",
    header: "Annual Leave",
    cell: ({ row }) => <div>{row.getValue("annualLeave")}</div>,
  },
  {
    accessorKey: "temporaryLeave",
    header: "Temp Leave",
    cell: ({ row }) => <div>{row.getValue("temporaryLeave")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const position = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(position.id)}
            >
              Copy position ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EmployeesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      experience: false,
      annualLeave: false,
      temporaryLeave: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter positions..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
