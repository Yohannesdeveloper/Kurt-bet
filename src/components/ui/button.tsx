import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2",
        premium: "bg-gradient-to-r from-primary to-[#C89B3C] text-white shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-[#B8892E] transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2",
        glow: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(200,155,60,0.3)] hover:shadow-[0_0_30px_rgba(200,155,60,0.5)] focus-visible:ring-2 focus-visible:ring-offset-2",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
