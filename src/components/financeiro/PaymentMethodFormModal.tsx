"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import {
  createPaymentMethod,
  updatePaymentMethod,
  type PaymentMethodDTO,
} from "@/services/financeiro";

type Form = {
  code: string;
  description: string;
};

export function PaymentMethodFormModal({
  open,
  onClose,
  onSaved,
  method,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: (id: string) => void;
  method?: PaymentMethodDTO; // quando presente, edita
}) {
  const isEdit = Boolean(method);

  const [form, setForm] = React.useState<Form>({
    code: method?.code ?? "",
    description: method?.description ?? "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      code: method?.code ?? "",
      description: method?.description ?? "",
    });
  }, [open, method]);

  const salvar = useMutation({
    mutationFn: async () => {
      const code = (form.code || "").trim().toUpperCase();
      const description = (form.description || "").trim();
      if (!code) throw new Error("Informe o código do método (ex.: PIX, DINHEIRO, CARTAO_CREDITO).");
      if (!description) throw new Error("Informe a descrição.");

      if (isEdit) {
        const { id } = await updatePaymentMethod(method!.code, { description });
        return id;
      } else {
        const { id } = await createPaymentMethod({ code, description });
        return id;
      }
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "Método atualizado!" : "Método criado!");
      onSaved?.(id);
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao salvar método.");
    },
  });

  if (!open) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">{isEdit ? "Editar método" : "Novo método de pagamento"}</h3>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-5">
              <Field label="Código">
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  disabled={isEdit} // code é PK
                  placeholder="Ex.: PIX"
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-7">
              <Field label="Descrição">
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex.: Pix"
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
            {salvar.isPending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar método"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}