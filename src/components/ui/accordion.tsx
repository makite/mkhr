/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useContext, memo } from "react";
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
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(
  undefined,
);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion components must be used within an Accordion provider",
    );
  }
  return context;
};

export const Accordion = ({
  type = "multiple",
  defaultValue = [],
  children,
  className,
}: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);

  const toggleItem = useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        } else {
          return prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value];
        }
      });
    },
    [type],
  );

  const contextValue = React.useMemo(
    () => ({
      openItems,
      toggleItem,
      type,
    }),
    [openItems, toggleItem, type],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

// Memoize AccordionItem to prevent unnecessary re-renders
export const AccordionItem = memo(
  ({ value, children, className }: AccordionItemProps) => {
    const { openItems } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
      <div
        className={cn(
          "border rounded-lg overflow-hidden",
          isOpen && "border-primary/20",
          className,
        )}
        data-state={isOpen ? "open" : "closed"}
      >
        {/* Pass isOpen via context instead of cloning children */}
        <AccordionItemContext.Provider value={{ isOpen, value }}>
          {children}
        </AccordionItemContext.Provider>
      </div>
    );
  },
);

AccordionItem.displayName = "AccordionItem";

interface AccordionItemContextType {
  isOpen: boolean;
  value: string;
}

const AccordionItemContext = React.createContext<
  AccordionItemContextType | undefined
>(undefined);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be used within an AccordionItem",
    );
  }
  return context;
};

// Memoize AccordionTrigger
export const AccordionTrigger = memo(
  ({ children, className }: AccordionTriggerProps) => {
    const { isOpen, value } = useAccordionItem();
    const { toggleItem } = useAccordion();

    const handleClick = useCallback(() => {
      toggleItem(value);
    }, [toggleItem, value]);

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-all hover:bg-muted/50",
          className,
        )}
        aria-expanded={isOpen}
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
  },
);

AccordionTrigger.displayName = "AccordionTrigger";

// Memoize AccordionContent
export const AccordionContent = memo(
  ({ children, className }: AccordionContentProps) => {
    const { isOpen } = useAccordionItem();

    if (!isOpen) return null;

    return (
      <div className={cn("p-4 border-t", className)} data-state="open">
        {children}
      </div>
    );
  },
);

AccordionContent.displayName = "AccordionContent";
