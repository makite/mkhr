/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string[];
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClick?: () => void;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

const AccordionContext = React.createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
  type?: "single" | "multiple";
}>({
  openItems: [],
  toggleItem: () => {},
  type: "multiple",
});

export const Accordion = ({
  type = "multiple",
  defaultValue = [],
  children,
  className,
}: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);

  const toggleItem = (value: string) => {
    if (type === "single") {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value],
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({
  value,
  children,
  className,
}: AccordionItemProps) => {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        isOpen && "border-primary/20",
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, itemValue: value } as any);
        }
        return child;
      })}
    </div>
  );
};

export const AccordionTrigger = ({
  children,
  className,
  isOpen,
  onClick,
}: AccordionTriggerProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-all hover:bg-muted/50",
        className,
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
};

export const AccordionContent = ({
  children,
  className,
  isOpen,
}: AccordionContentProps) => {
  if (!isOpen) return null;

  return <div className={cn("p-4 border-t", className)}>{children}</div>;
};

// Hook to use accordion context
// eslint-disable-next-line react-refresh/only-export-components
export const useAccordionItem = () => {
  const context = React.useContext(AccordionContext);
  const [, setItemValue] = React.useState<string>();

  const createItemHandlers = (value: string) => ({
    isOpen: context.openItems.includes(value),
    onClick: () => context.toggleItem(value),
  });

  return { ...context, createItemHandlers, setItemValue };
};
