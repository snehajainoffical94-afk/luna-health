import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-luna-purple/20 text-luna-purple-light",
        gold: "border-transparent bg-luna-gold/20 text-luna-gold",
        success: "border-transparent bg-green-500/20 text-green-400",
        destructive: "border-transparent bg-red-500/20 text-red-400",
        outline: "border-white/10 text-white/70",
        low: "border-blue-400/20 bg-blue-400/10 text-blue-400",
        normal: "border-green-400/20 bg-green-400/10 text-green-400",
        high: "border-red-400/20 bg-red-400/10 text-red-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
