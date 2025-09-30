// src/components/ui/form/Field.tsx
"use client";
import * as React from "react";
import { cx } from "./cx";
import { colors, fieldWrap, inputBase, selectBase, textareaBase } from "./styles";

type BaseProps = {
  label?: string;
  hint?: string;
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

export function Input({
  left,
  right,
  className,
  inputClassName,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  left?: React.ReactNode;
  right?: React.ReactNode;
  inputClassName?: string;
}) {
  return (
    <div className={cx("relative", fieldWrap, className)}>
      {left && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70 select-none">
          {left}
        </div>
      )}
      <input
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

export function Select({
  className,
  selectClassName,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  selectClassName?: string;
}) {
  return (
    <div className={cx("relative", fieldWrap, className)}>
      <select {...rest} className={cx(selectBase, selectClassName)}>
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

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cx(fieldWrap, className)}>
      <textarea {...rest} className={textareaBase} />
    </div>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={cx(
        "inline-flex items-center gap-2 select-none rounded-xl px-3 py-2 cursor-pointer",
        fieldWrap,
        className
      )}
    >
      <input
        type="checkbox"
        {...rest}
        className="h-4 w-4 accent-purple-600 cursor-pointer"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}