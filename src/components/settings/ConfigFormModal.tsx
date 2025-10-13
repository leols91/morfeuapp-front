"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";

// payloads unificados
export type UpsertPayload =
  | { configName: string; configValue: string }
  | { userConfigName: string; userConfigValue: string };

export function ConfigFormModal({
  open,
  scope, // "pousada" | "usuario"
  item,
  onClose,
  onSaved,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  scope: "pousada" | "usuario";
  item?: any; // PousadaConfigDTO | UserConfigDTO
  onClose: () => void;
  onSaved?: () => void;
  onCreate: (payload: UpsertPayload) => Promise<any>;
  onUpdate: (id: string, payload: UpsertPayload) => Promise<any>;
}) {
  const isEdit = !!item;

  const [key, setKey] = React.useState<string>(() =>
    isEdit ? (scope === "pousada" ? item.configName : item.userConfigName) : ""
  );
  const [val, setVal] = React.useState<string>(() =>
    isEdit ? (scope === "pousada" ? item.configValue : item.userConfigValue) : ""
  );
  const [saving, setSaving] = React.useState(false);

  async function save() {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    const payload: UpsertPayload =
      scope === "pousada"
        ? { configName: trimmedKey, configValue: val }
        : { userConfigName: trimmedKey, userConfigValue: val };

    setSaving(true);
    try {
      if (isEdit) {
        await onUpdate(item.id, payload);
      } else {
        await onCreate(payload);
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-lg">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar" : "Nova"} configuração — {scope === "pousada" ? "Pousada" : "Usuário"}
          </h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Chave">
                <Input
                  placeholder={scope === "pousada" ? "ex.: theme_color" : "ex.: theme_mode"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  disabled={isEdit} // manter chave imutável ao editar
                />
              </Field>
            </div>
            <div className="col-span-12">
              <Field label="Valor">
                <Input
                  placeholder="ex.: azul / dark / qualquer string"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving || !key.trim()}>
            {saving ? "Salvando…" : isEdit ? "Salvar" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}