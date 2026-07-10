import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ethiopian-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-ethiopian-coffee text-ethiopian-cream hover:bg-ethiopian-coffee/90 shadow-sm hover:shadow-md",
        destructive: "bg-ethiopian-clay text-white hover:bg-ethiopian-clay/90 shadow-sm",
        outline: "border-2 border-ethiopian-gold/30 bg-background hover:bg-ethiopian-gold/10 text-ethiopian-coffee",
        secondary: "bg-ethiopian-gold text-white hover:bg-ethiopian-gold/80 shadow-sm",
        ghost: "hover:bg-ethiopian-gold/10 text-ethiopian-coffee",
        link: "text-ethiopian-gold underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-ethiopian-gold to-ethiopian-clay text-white shadow-lg hover:shadow-xl hover:from-ethiopian-gold/90 hover:to-ethiopian-clay/90 transform hover:-translate-y-0.5",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg",
        glow: "bg-ethiopian-gold text-white shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_30px_rgba(212,160,23,0.5)]",
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
