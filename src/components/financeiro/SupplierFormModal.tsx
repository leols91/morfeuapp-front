"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import {
  createSupplier,
  updateSupplier,
  type SupplierDTO,
} from "@/services/estoque";

type Form = {
  legalName: string;
  documentId?: string;
  email?: string;
  phone?: string;
};

export function SupplierFormModal({
  open,
  onClose,
  onSaved,
  supplier,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: (id: string) => void;
  supplier?: SupplierDTO; // quando presente, edita
}) {
  const [form, setForm] = React.useState<Form>({
    legalName: supplier?.legalName ?? "",
    documentId: supplier?.documentId ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      legalName: supplier?.legalName ?? "",
      documentId: supplier?.documentId ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
    });
  }, [open, supplier]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        legalName: (form.legalName || "").trim(),
        documentId: (form.documentId || "").trim() || null,
        email: (form.email || "").trim() || null,
        phone: (form.phone || "").trim() || null,
      };
      if (!payload.legalName) throw new Error("Informe o nome/razão social.");
      if (supplier) {
        const { id } = await updateSupplier(supplier.id, payload);
        return id;
      } else {
        const { id } = await createSupplier(payload);
        return id;
      }
    },
    onSuccess: (id) => {
      toast.success(supplier ? "Fornecedor atualizado!" : "Fornecedor criado!");
      onSaved?.(id);
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao salvar fornecedor.");
    },
  });

  if (!open) return null;
  const isEdit = Boolean(supplier);

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
          </h3>
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
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
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
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar fornecedor"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}