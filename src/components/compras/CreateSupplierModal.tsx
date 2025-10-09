"use client";
import * as React from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import { Field, Input } from "@/components/ui/form/Field";
import { SupplierDTO, createSupplier, type CreateSupplierPayload } from "@/services/estoque";

const supplierSchema = z.object({
  legalName: z.string().min(1, "Informe o nome/razão social"),
  documentId: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});
type SupplierForm = z.infer<typeof supplierSchema>;

export function CreateSupplierModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (s: SupplierDTO) => void;
}) {
  const [form, setForm] = React.useState<SupplierForm>({
    legalName: "",
    documentId: "",
    email: "",
    phone: "",
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const v = supplierSchema.parse(form);
      const payload: CreateSupplierPayload = {
        legalName: v.legalName,
        documentId: v.documentId || null,
        email: v.email || null,
        phone: v.phone || null,
      };
      const { id } = await createSupplier(payload);
      const novo: SupplierDTO = {
        id,
        legalName: payload.legalName,
        documentId: payload.documentId ?? undefined,
        email: payload.email ?? undefined,
        phone: payload.phone ?? undefined,
      };
      return novo;
    },
    onSuccess: (s) => {
      toast.success("Fornecedor criado!");
      onCreated(s);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar fornecedor."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Novo fornecedor</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Nome/Razão social">
                <Input
                  value={form.legalName}
                  onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Documento (CNPJ/CPF)">
                <Input
                  value={form.documentId ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, documentId: e.target.value }))}
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Telefone">
                <Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-12">
              <Field label="E-mail">
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}