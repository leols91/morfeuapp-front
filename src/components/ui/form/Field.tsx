"use client";
import * as React from "react";
import { cx } from "./cx";
import { colors, fieldWrap, inputBase, selectBase, textareaBase } from "./styles";

type BaseProps = {
  label?: React.ReactNode; // ← antes era string
  hint?: React.ReactNode;  // ← idem
  error?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Field({ label, hint, error, className, children }: BaseProps) {
  return (
    <div className={className}>
      {label && <label className={colors.label + " block"}>{label}</label>}
      {children}
      {hint && !error && <div className={colors.help}>{hint}</div>}
      {error && <div className={colors.error}>{error}</div>}
    </div>
  );
}

/** INPUT — agora com forwardRef para RHF */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {
  left?: React.ReactNode;
  right?: React.ReactNode;
  inputClassName?: string;
}>(
  ({ left, right, className, inputClassName, ...rest }, ref) => {
    return (
      <div className={cx("relative", fieldWrap, className)}>
        {left && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70 select-none">
            {left}
          </div>
        )}
        <input
          ref={ref}
          {...rest}
          className={cx(
            inputBase,
            left ? "pl-9" : undefined,
            right ? "pr-9" : undefined,
            inputClassName
          )}
        />
        {right && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
            {right}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/** SELECT — agora com forwardRef para RHF */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & {
  selectClassName?: string;
}>(
  ({ className, selectClassName, children, ...rest }, ref) => {
    return (
      <div className={cx("relative", fieldWrap, className)}>
        <select ref={ref} {...rest} className={cx(selectBase, selectClassName)}>
          {children}
        </select>
        <div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
                     text-base opacity-60 select-none transition-all duration-200
                     group-focus-within:opacity-90 group-hover:opacity-80 group-focus-within:rotate-180"
        >
          ▾
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

/** TEXTAREA — agora com forwardRef para RHF */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => {
    return (
      <div className={cx(fieldWrap, className)}>
        <textarea ref={ref} {...rest} className={textareaBase} />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/** CHECKBOX (não precisa de forwardRef para watch funcionar, mas podemos aceitar) */
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
  ({ label, className, ...rest }, ref) => {
    return (
      <label
        className={cx(
          "inline-flex items-center gap-2 select-none rounded-xl px-3 py-2 cursor-pointer",
          fieldWrap,
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          {...rest}
          className="h-4 w-4 accent-purple-600 cursor-pointer"
        />
        <span className="text-sm">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";