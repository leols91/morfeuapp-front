"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import {
  createCashAccount,
  updateCashAccount,
  type CashAccountDTO,
} from "@/services/financeiro";

type Form = {
  name: string;
  typeCode: string;       // "cash" | "bank" (mantemos livre caso tenha outros)
  openingBalance: number;
};

export function AccountFormModal({
  open,
  onClose,
  onCreated,
  account, // <- opcional: quando presente, entra no modo edição
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
  account?: CashAccountDTO;
}) {
  const [form, setForm] = React.useState<Form>({
    name: account?.name ?? "",
    typeCode: account?.typeCode ?? "cash",
    openingBalance: account?.openingBalance ?? 0,
  });

  // Atualiza o form quando abrir/alterar a conta passada
  React.useEffect(() => {
    if (!open) return;
    setForm({
      name: account?.name ?? "",
      typeCode: account?.typeCode ?? "cash",
      openingBalance: account?.openingBalance ?? 0,
    });
  }, [open, account]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        typeCode: form.typeCode,
        openingBalance: Number(form.openingBalance) || 0,
      };

      if (!payload.name) throw new Error("Informe o nome da conta.");

      if (account) {
        // editar
        const { id } = await updateCashAccount(account.id, payload);
        return id;
      } else {
        // criar
        const { id } = await createCashAccount(payload);
        return id;
      }
    },
    onSuccess: (id: string) => {
      toast.success(account ? "Conta atualizada!" : "Conta criada!");
      onCreated?.(id);
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao salvar.");
    },
  });

  if (!open) return null;

  const isEdit = Boolean(account);

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-lg">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar conta" : "Nova conta"}
          </h3>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Nome">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Tipo">
                <Select
                  value={form.typeCode}
                  onChange={(e) => setForm((f) => ({ ...f, typeCode: e.target.value }))}
                >
                  <option value="cash">Caixa</option>
                  <option value="bank">Banco</option>
                </Select>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Saldo inicial">
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={String(form.openingBalance)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      openingBalance: Number((e.target.value || "0").replace(",", ".")) || 0,
                    }))
                  }
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
            {salvar.isPending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar conta"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}