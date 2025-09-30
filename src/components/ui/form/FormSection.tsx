"use client";
import * as React from "react";
import { sectionWrap, colors } from "./styles";

export function FormSection({
  title,
  children,
  footer,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={sectionWrap}>
      {title && (
        <div className={"px-5 py-4 border-b " + colors.divider}>
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
      {footer && <div className={"px-5 py-4 border-t " + colors.divider}>{footer}</div>}
    </div>
  );
}

export function FormRow({
  children,
}: {
  /** 12-cols; no desktop vira grid; mobile empilha */
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">{children}</div>
  );
}

export function Col({
  span = 12,
  children,
}: {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  children: React.ReactNode;
}) {
  return <div className={`md:col-span-${span}`}>{children}</div>;
}