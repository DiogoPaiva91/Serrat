import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", label, ...props }, ref) => {
    if (label && orientation === "horizontal") {
      return (
        <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="separator"
        className={cn(
          orientation === "horizontal" ? "h-px w-full bg-border" : "w-px h-full bg-border",
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
