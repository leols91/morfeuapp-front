"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirmar",
  danger = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onCancel}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">{title}</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          {description ? <p className="text-sm opacity-80">{description}</p> : null}
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant={danger ? "danger" : "default"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}