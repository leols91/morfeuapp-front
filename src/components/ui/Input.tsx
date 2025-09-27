import * as React from "react";
import { cn } from "@/components/ui/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-2xl border bg-transparent px-3 py-2 text-sm outline-none",
        "border-gray-300 focus:ring-2 focus:ring-brand-400",
        "dark:border-white/10 dark:focus:ring-brand-500/60",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";