import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5722] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#ff5722] text-white hover:bg-[#ff6b3d] rounded-full",
        outline: "border border-white/15 bg-transparent hover:bg-white/5 text-neutral-200 rounded-full",
        ghost: "hover:bg-white/5 text-neutral-400 hover:text-white rounded-lg",
        destructive: "bg-red-600 text-white hover:bg-red-500 rounded-full",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs rounded-full",
        lg: "h-12 px-8 text-base rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
