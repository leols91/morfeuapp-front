"use client";
import * as React from "react";
import { useState } from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { money, type Id, type APItem, type CashAccount } from "@/components/financeiro/utils";

export function PayInvoiceModal({
  open,
  ap,
  accounts,
  onClose,
  onConfirm,
}: {
  open: boolean;
  ap: APItem;
  accounts: CashAccount[];
  onClose: () => void;
  onConfirm: (p: { apId: Id; accountId: Id; paidAt: string; amount: number; reference?: string }) => void;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<number>(ap.amount);
  const [reference, setReference] = useState<string>("");

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Pagar conta</h3>
          <p className="text-xs opacity-70 mt-0.5">{ap.description}</p>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Conta de pagamento">
                <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — saldo {money(a.balance)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Data do pagamento">
                <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Valor">
                <Input
                  inputMode="decimal"
                  value={String(amount)}
                  onChange={(e) => setAmount(Number(e.target.value.replace(",", ".")) || 0)}
                />
              </Field>
              <div className="text-[11px] opacity-70 mt-1">
                Valor original: <b>{money(ap.amount)}</b>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Referência (opcional)">
                <Input
                  placeholder="Ex.: NF 123, recibo, etc."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onConfirm({
                apId: ap.id,
                accountId,
                paidAt: new Date(paidAt).toISOString(),
                amount,
                reference: reference || undefined,
              })
            }
          >
            Confirmar pagamento
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}