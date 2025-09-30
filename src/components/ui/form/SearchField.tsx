"use client";
import * as React from "react";
import { cx } from "./cx";
import { colors, fieldWrap } from "./styles";

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode; // ex.: <HospedeSearch .../>
};

/**
 * SearchField
 * - Usa o mesmo visual dos nossos inputs (fieldWrap)
 * - Remove bordas internas do componente filho (autocomplete/search)
 * - Mantém altura mínima, paddings e comportamento de focus/hover unificado
 */
export function SearchField({ label, hint, error, className, children }: BaseProps) {
  return (
    <div className={className}>
      {label && <label className={colors.label + " block"}>{label}</label>}

      <div
        className={cx(
          fieldWrap,
          "min-h-10 px-2 py-1 flex items-center gap-2",
          "[&_*:where(input,select,textarea,button)]:bg-transparent",
          "[&_*:where(input,select,textarea)]:outline-none",
          "[&_*:where(input,select,textarea)]:ring-0",
          "[&_*:where(input,select,textarea)]:border-0",
          "[&_*:where(input,select,textarea)]:w-full",
          "relative overflow-visible"
        )}
      >
        {/* 🔧 garante que o componente interno ocupe toda a largura */}
        <div className="w-full">{children}</div>
      </div>

      {hint && !error && <div className={colors.help}>{hint}</div>}
      {error && <div className={colors.error}>{error}</div>}
    </div>
  );
}