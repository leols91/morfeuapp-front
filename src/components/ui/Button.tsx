import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/components/ui/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "danger"; // ✅ nova variant
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant = "default", size = "md", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const base =
      "inline-flex items-center justify-center rounded-2xl font-medium transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      default: "bg-brand-600 text-white hover:bg-brand-700",
      outline:
        "border text-brand-700 hover:bg-black/5 border-gray-300 dark:text-gray-200 dark:border-white/10 dark:hover:bg-white/5",
      ghost: "hover:bg-black/5 dark:hover:bg-white/5",
      danger:
        // 🔥 estilização danger consistente com o sistema
        "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 focus:ring-2 focus:ring-rose-500 focus:outline-none",
    }[variant];

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
    }[size];

    return (
      <Comp
        ref={ref}
        className={cn(base, variants, sizes, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";