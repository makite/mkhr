import { MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import type { Employees } from "./employees-table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
// Import the new component
import EmployeeActionDialogs from "./employee-action-dialogs";

type TableRowOptionsProps = {
  position: Employees;
};

export default function TableRowOptions({ position }: TableRowOptionsProps) {
  // State to control the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State to control which dialog is open
  const [activeDialog, setActiveDialog] = useState<
    "view" | "edit" | "delete" | null
  >(null);

  // Function to close dropdown and open dialog after a short delay
  const handleActionClick = (actionType: "view" | "edit" | "delete") => {
    // 1. Close the dropdown menu
    setIsDropdownOpen(false);

    // 2. Delay opening the dialog to prevent flash/conflict
    setTimeout(() => {
      setActiveDialog(actionType);
    }, 50);
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
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

          {/* Use the handler on the onSelect event */}
          <DropdownMenuItem onSelect={() => handleActionClick("view")}>
            <span>View</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => handleActionClick("edit")}>
            <span>Edit</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => handleActionClick("delete")}>
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 💥 This is the key change: Render the Dialogs component here 💥 */}
      <EmployeeActionDialogs
        position={position}
        activeDialog={activeDialog}
        setActiveDialog={setActiveDialog}
      />
    </>
  );
}
