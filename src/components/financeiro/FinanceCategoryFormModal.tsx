"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form/Field";
import {
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory,
  type FinanceCategoryDTO,
} from "@/services/financeiro";

export function FinanceCategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category?: FinanceCategoryDTO;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = React.useState(category?.name ?? "");
  const [description, setDescription] = React.useState(category?.description ?? "");
  const [kind, setKind] = React.useState<"expense" | "revenue">(category?.kind ?? "expense");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description ?? "");
      setKind(category.kind);
    } else {
      setName("");
      setDescription("");
      setKind("expense");
    }
  }, [category, open]);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (!isEdit) {
        await createFinanceCategory({ name: name.trim(), description: description.trim() || null, kind });
      } else {
        // Se o tipo mudar (ex.: de despesa -> receita), a estratégia: cria na nova coleção e remove a antiga.
        if (kind !== category!.kind) {
          await createFinanceCategory({ name: name.trim(), description: description.trim() || null, kind });
          await deleteFinanceCategory(category!.id, category!.kind);
        } else {
          await updateFinanceCategory(category!.id, category!.kind, {
            name: name.trim(),
            description: description.trim() || null,
          });
        }
      }
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <Field label="Tipo">
                <Select value={kind} onChange={(e) => setKind(e.target.value as "expense" | "revenue")}>
                  <option value="expense">Despesa</option>
                  <option value="revenue">Receita</option>
                </Select>
              </Field>
            </div>
            <div className="col-span-12 md:col-span-8">
              <Field label="Nome">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-12">
              <Field label="Descrição (opcional)">
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}