"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";

const schema = z.object({
  legalName: z.string().min(1, "Informe o nome/razão social"),
  documentId: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type SupplierFormOutput = z.infer<typeof schema>;

export function SupplierForm({
  initialData,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  initialData?: Partial<SupplierFormOutput>;
  isSubmitting?: boolean;
  onSubmit: (data: SupplierFormOutput) => void;
  onCancel: () => void;
}) {
  const form = useForm<SupplierFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: initialData?.legalName ?? "",
      documentId: initialData?.documentId ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Field label="Razão social / Nome fantasia" error={form.formState.errors.legalName?.message}>
              <Input {...form.register("legalName")} />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-3">
            <Field label="Documento (CNPJ/CPF)">
              <Input {...form.register("documentId")} />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-3">
            <Field label="Telefone">
              <Input {...form.register("phone")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field label="E-mail" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="surface-2">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}