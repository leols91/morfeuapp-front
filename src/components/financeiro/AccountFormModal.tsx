"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import ModalBase from "@/components/ui/ModalBase";
import { createCashAccount, type CreateAccountPayload } from "@/services/financeiro";
import toast from "react-hot-toast";

export function AccountFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [typeCode, setTypeCode] = React.useState("cash");
  const [openingBalance, setOpeningBalance] = React.useState("0");

  const salvar = useMutation({
    mutationFn: async () => {
      const payload: CreateAccountPayload = {
        name: name.trim(),
        typeCode,
        openingBalance: Number(openingBalance.replace(",", ".")) || 0,
      };
      if (!payload.name) throw new Error("Informe o nome da conta.");
      const { id } = await createCashAccount(payload);
      return id;
    },
    onSuccess: (id) => {
      toast.success("Conta criada!");
      onCreated?.(id);
      onClose();
      setName("");
      setOpeningBalance("0");
      setTypeCode("cash");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao criar conta."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Nova conta de caixa</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Nome da conta">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Tipo">
                <select className="form-select" value={typeCode} onChange={(e) => setTypeCode(e.target.value)}>
                  <option value="cash">Caixa</option>
                  <option value="bank">Banco</option>
                </select>
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Saldo inicial">
                <Input
                  inputMode="decimal"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
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