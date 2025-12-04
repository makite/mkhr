import EmployeeForm from "../form/employee-form";
import type { Employees } from "./employees-table";
// import EmployeeView from "./EmployeeView";
// import EmployeeDeleteConfirmation from "./EmployeeDeleteConfirmation";
import type { RowData } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type EmployeeActionDialogsProps = {
  position: Employees;
  activeDialog: "view" | "edit" | "delete" | null;
  setActiveDialog: (dialogType: "view" | "edit" | "delete" | null) => void;
};

export default function EmployeeActionDialogs({
  position,
  activeDialog,
  setActiveDialog,
}: EmployeeActionDialogsProps) {
  // Helper to change the state when a dialog is closed
  const handleOpenChange = (
    type: "view" | "edit" | "delete",
    open: boolean
  ) => {
    if (!open) {
      setActiveDialog(null);
    }
    // Note: We don't need to do anything if it's opening, as the parent controls 'activeDialog'
  };
  console.log(JSON.stringify(position));

  return (
    <>
      {/* View Dialog */}
      <Dialog
        open={activeDialog === "view"}
        onOpenChange={(open) => handleOpenChange("view", open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{`View Details for ${position.firstName}`}</DialogTitle>
            <DialogDescription>
              A read-only view of the employee's full profile.
            </DialogDescription>
          </DialogHeader>
          <div>view</div>
          {/* <EmployeeView employee={position} /> */}
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={activeDialog === "edit"}
        onOpenChange={(open) => handleOpenChange("edit", open)}
      >
        <DialogContent className="sm:max-w-[1200px] max-h-[90svh]">
          <DialogHeader>
            <DialogTitle>{`Edit ${position.firstName}`}</DialogTitle>
            <DialogDescription>
              Make changes to the employee profile here.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm employee={position} mode="edit" />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={activeDialog === "delete"}
        onOpenChange={(open) => handleOpenChange("delete", open)}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{`Delete ${position.firstName}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              employee?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* <EmployeeDeleteConfirmation employeeId={position.id} /> */}
          <div>delete</div>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction>Confirm Deletion</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
