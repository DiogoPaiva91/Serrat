import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusDotVariants = cva("inline-block rounded-full shrink-0", {
  variants: {
    status: {
      online: "bg-green-500",
      offline: "bg-neutral-400",
      busy: "bg-red-500",
      away: "bg-amber-500",
      pending: "bg-blue-500",
    },
    size: {
      sm: "h-2 w-2",
      default: "h-2.5 w-2.5",
      lg: "h-3 w-3",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: { status: "online", size: "default", pulse: false },
});

interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  className?: string;
  label?: string;
}

export function StatusDot({ status, size, pulse, className, label }: StatusDotProps) {
  const statusLabels: Record<string, string> = {
    online: "Ativo",
    offline: "Inativo",
    busy: "Ocupado",
    away: "Ausente",
    pending: "Pendente",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn(statusDotVariants({ status, size, pulse, className }))} />
      {label !== undefined ? (
        <span className="text-sm">{label}</span>
      ) : null}
    </span>
  );
}

export { statusDotVariants };
