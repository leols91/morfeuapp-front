"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/form/Field";
import { SupplierDTO, searchSuppliers } from "@/services/estoque";
import { SupplierState } from "./types";

export function SupplierPicker({
  supplier,
  setNote,
  note,
  openCreate,
}: {
  supplier: SupplierState;
  note: string;
  setNote: (v: string) => void;
  openCreate: () => void;
}) {
  // busca simples
  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchSuppliers(supplier.query);
      if (!active) return;
      supplier.setOptions(r);
    })();
    return () => { active = false; };
  }, [supplier.query]); // eslint-disable-line

  return (
    <div className="surface-2">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <Field label="Fornecedor">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Buscar fornecedor…"
                value={supplier.value ? supplier.value.legalName : supplier.query}
                onChange={(e) => {
                  supplier.setValue(null);
                  supplier.setQuery(e.target.value);
                }}
                onFocus={() => {
                  if (!supplier.value) supplier.setQuery((v) => v);
                }}
              />
              <Button type="button" variant="outline" onClick={openCreate}>
                Novo
              </Button>
            </div>

            {!supplier.value && supplier.query.trim() && supplier.options.length > 0 && (
              <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-64 overflow-auto">
                {supplier.options.map((s: SupplierDTO) => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                    onClick={() => {
                      supplier.setValue(s);
                      supplier.setQuery("");
                    }}
                  >
                    <div className="font-medium">{s.legalName}</div>
                    <div className="text-[11px] opacity-70">
                      {[s.documentId, s.phone, s.email].filter(Boolean).join(" • ")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Field>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Field label="Observações da compra (opcional)">
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );
}