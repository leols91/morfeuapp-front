"use client";
import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import { Field, Input } from "@/components/ui/form/Field";
import { ProdutoDTO } from "@/services/estoque";
import { toNum as _toNum } from "./utils";

export function QuantityCostModal({
  open,
  produto,
  onCancel,
  onConfirm,
  toNum = _toNum,
}: {
  open: boolean;
  produto: ProdutoDTO;
  onCancel: () => void;
  onConfirm: (quantity: number, unitCost: number) => void;
  toNum?: (s: string) => number;
}) {
  const [qtd, setQtd] = React.useState<string>("");
  const [custo, setCusto] = React.useState<string>("");
  const [total, setTotal] = React.useState<string>("");

  const [lastEdited, setLastEdited] = React.useState<"qty" | "unit" | "total" | null>(null);

  const nQtd = React.useMemo(() => toNum(qtd), [qtd]);
  const nCusto = React.useMemo(() => toNum(custo), [custo]);
  const nTotal = React.useMemo(() => toNum(total), [total]);

  React.useEffect(() => {
    if (lastEdited === "total") return;
    if (!Number.isFinite(nQtd) || !Number.isFinite(nCusto)) return;
    const t = nQtd * nCusto;
    const tStr = t ? String(t) : "";
    setTotal((prev) => (prev !== tStr ? tStr : prev));
  }, [nQtd, nCusto, lastEdited]);

  React.useEffect(() => {
    if (lastEdited !== "total") return;
    if (!Number.isFinite(nTotal)) return;
    if (nQtd > 0) {
      const u = nTotal / nQtd;
      const uStr = u ? String(u) : "";
      setCusto((prev) => (prev !== uStr ? uStr : prev));
    }
  }, [nTotal, nQtd, lastEdited]);

  const handleConfirm = () => {
    const qty = nQtd;
    if (qty <= 0) return toast.error("Informe uma quantidade válida.");

    let unit = nCusto;
    if (lastEdited === "total") {
      if (nTotal < 0) return toast.error("Informe um total válido.");
      unit = qty > 0 ? nTotal / qty : 0;
    }
    if (unit < 0) return toast.error("Informe um custo válido.");

    const unitRounded = Math.round(unit * 100) / 100;
    onConfirm(qty, unitRounded);
  };

  if (!open) return null;

  return (
    <ModalBase open={open} onClose={onCancel}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Adicionar “{produto.name}”</h3>
          <p className="text-xs opacity-70 mt-0.5">
            {produto.unit} {produto.sku ? `• SKU: ${produto.sku}` : ""}
          </p>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Field label="Qtde">
                <Input
                  autoFocus
                  inputMode="decimal"
                  className="text-right tabular-nums"
                  value={qtd}
                  onChange={(e) => { setQtd(e.target.value); setLastEdited("qty"); }}
                  placeholder="Ex.: 12"
                />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Custo unit.">
                <Input
                  inputMode="decimal"
                  className="text-right tabular-nums"
                  value={custo}
                  onChange={(e) => { setCusto(e.target.value); setLastEdited("unit"); }}
                  placeholder="Ex.: 1,00"
                />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Total">
                <Input
                  inputMode="decimal"
                  className="text-right tabular-nums"
                  value={total}
                  onChange={(e) => { setTotal(e.target.value); setLastEdited("total"); }}
                  placeholder="Ex.: 12,00"
                />
              </Field>
              {lastEdited === "total" && nQtd === 0 ? (
                <div className="mt-1 text-[11px] opacity-70">
                  Informe a <b>Qtde</b> para calcular o custo unitário.
                </div>
              ) : null}
            </div>
          </div>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}