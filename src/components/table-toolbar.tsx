import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode } from "react";
import { camelToWords } from "../utils/helper.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
type TableToolbarProps = {
  children: ReactNode;
  selectedCount?: number;
  onDelete?: () => void;
  table:
    | "position"
    | "grade"
    | "branch"
    | "scale"
    | "employeeScale"
    | "employee";
};
// const deleteWarnings = [
//   {
//     id: "stgPositions",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this position?",
//   },
//   {
//     id: "stgGrades",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this grade?",
//   },
//   {
//     id: "stgBranches",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this employee?",
//   },
//   {
//     id: "stgScales",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this employee?",
//   },
//   {
//     id: " stgEmpScales",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this employee?",
//   },
//   {
//     id: "adminEmployees",
//     message:
//       "This action cannot be undone. Are you sure you want to delete this employee?",
//   },
// ];

export default function TableToolbar({
  children,
  selectedCount = 0,
  onDelete,
  table,
}: TableToolbarProps) {
  const tableName = camelToWords(table);

  return (
    <div className="flex gap-2 justify-end">
      <Dialog>
        <DialogTrigger>
          <Button className="bg-[#3E9E6C] cursor-pointer hover:bg-[#4ec587]">
            {" "}
            <PlusIcon /> Add New
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1200px]">{children}</DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger disabled={selectedCount === 0}>
          <Button variant="destructive" disabled={selectedCount === 0}>
            <Trash2Icon /> Delete {selectedCount !== 0 && `${selectedCount}`}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{`Delete ${tableName}`}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete{" "}
              <span className="font-bold text-red-500">
                {selectedCount} selected {tableName}
                {selectedCount !== 1 ? "s" : ""}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDelete) onDelete();
              }}
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline">
        <DownloadIcon />
        Export
      </Button>

      <Button variant="outline">
        <RefreshCwIcon />
        Refresh
      </Button>
    </div>
  );
}
