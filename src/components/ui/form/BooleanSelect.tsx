"use client";
import * as React from "react";
import { Field, Select } from "./Field";

type Props = {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

export function BooleanSelect({ label, value, onChange, className }: Props) {
  return (
    <Field label={label} className={className}>
      <Select
        value={value ? "yes" : "no"}
        onChange={(e) => onChange(e.target.value === "yes")}
      >
        <option value="no">Não</option>
        <option value="yes">Sim</option>
      </Select>
    </Field>
  );
}