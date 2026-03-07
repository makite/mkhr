// hooks/use-toast.ts
import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      return sonnerToast.error(title || "Error", {
        description: description,
      });
    }

    if (variant === "success") {
      return sonnerToast.success(title || "Success", {
        description: description,
      });
    }

    return sonnerToast(title || "Notification", {
      description: description,
    });
  };

  return { toast };
}
