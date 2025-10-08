"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";

export function ConfirmDeleteProdutoModal({
  open,
  onClose,
  onConfirm,
  produtoName,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  produtoName?: string;
  isLoading?: boolean;
}) {
  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card className="w-full" maxWidth="max-w-lg">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Excluir produto</h3>
          <p className="text-xs opacity-70 mt-1">
            Esta ação é permanente e não poderá ser desfeita.
          </p>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="space-y-3 text-sm">
            <p>
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-semibold">{produtoName ?? "—"}</span>?
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>O produto deixará de aparecer em listagens.</li>
              <li>
                Se houver movimentações, o backend pode recusar a exclusão (erro 409). Nesse caso,
                sugerimos marcar como <em>Sem controle</em> e/ou manter o produto inativo (se existir essa flag)
                ao invés de excluir.
              </li>
            </ul>
          </div>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Excluindo…" : "Excluir"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}