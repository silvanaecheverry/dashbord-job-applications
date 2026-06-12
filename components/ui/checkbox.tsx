import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-input text-brand-600 accent-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
        {input}
        {label}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
