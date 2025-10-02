// src/components/reservas/ChangeAcomodacaoModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import type { AcomodacaoOption } from "@/types/reserva";
import { Field, Select, Textarea } from "@/components/ui/form/Field";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { roomId?: string | null; bedId?: string | null; notes?: string | null }) => Promise<void>;
  options: AcomodacaoOption[];
  currentLabel?: string;
};

const schema = z.object({
  alvo: z.string().min(1, "Selecione uma acomodação"),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function ChangeAcomodacaoModal({ open, onClose, onConfirm, options, currentLabel }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { alvo: "", notes: "" },
  });

  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) form.reset({ alvo: "", notes: "" });
  }, [open, form]);

  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      const [kind, id] = v.alvo.split(":");
      await onConfirm({
        roomId: kind === "room" ? id : null,
        bedId:  kind === "bed"  ? id : null,
        notes:  v.notes || null,
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao trocar acomodação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Trocar acomodação</h3>
          {currentLabel && <p className="text-sm opacity-70">Atual: {currentLabel}</p>}
        </ModalBase.Header>

        <ModalBase.Body>
          <form id="form-change-acom" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Field label="Nova acomodação" error={form.formState.errors.alvo?.message}>
              <Select
                value={form.watch("alvo")}
                onChange={(e) =>
                  form.setValue("alvo", e.target.value, { shouldDirty: true, shouldValidate: true })
                }
              >
                <option value="">Selecione…</option>
                {options.map((o) => (
                  <option key={o.id} value={`${o.kind}:${o.id}`}>{o.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Observações (opcional)">
              <Textarea rows={3} placeholder="Motivo da troca, etc." {...form.register("notes")} />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="form-change-acom" type="submit" disabled={saving}>
            {saving ? "Trocando…" : "Confirmar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}