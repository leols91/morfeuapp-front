// src/components/reservas/AddChargeModal.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { ProductOption } from "@/types/reserva";

// 👇 Tipo local para serviços (igual ao usado no service)
type ServiceOption = { id: string; name: string; price: number };

type Kind = "product" | "service";

type ProductPayload = {
  kind: "product";
  productId: string;
  qty: number;
  unitPrice: number;
  description?: string;
};

type ServicePayload = {
  kind: "service";
  serviceId: string;
  qty: number;
  unitPrice: number;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ProductPayload | ServicePayload) => Promise<void>;
  products: ProductOption[];
  services: ServiceOption[]; // serviços adicionais
};

export function AddChargeModal({ open, onClose, onConfirm, products, services }: Props) {
  const [kind, setKind] = React.useState<Kind>("product");

  // product
  const [productId, setProductId] = React.useState("");
  const [pQty, setPQty] = React.useState(1);
  const [pUnitPrice, setPUnitPrice] = React.useState<number | "">("");
  const [pDesc, setPDesc] = React.useState("");

  // service
  const [serviceId, setServiceId] = React.useState("");
  const [sQty, setSQty] = React.useState(1);
  const [sUnitPrice, setSUnitPrice] = React.useState<number | "">("");
  const [sDesc, setSDesc] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setKind("product");
    // reset product
    setProductId("");
    setPQty(1);
    setPUnitPrice("");
    setPDesc("");
    // reset service
    setServiceId("");
    setSQty(1);
    setSUnitPrice("");
    setSDesc("");
    setError(null);
  }, [open]);

  if (!open) return null;

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      if (kind === "product") {
        if (!productId) throw new Error("Selecione um produto.");
        const price =
          pUnitPrice === ""
            ? products.find((p) => p.id === productId)?.price ?? 0
            : Number(pUnitPrice);
        await onConfirm({
          kind,
          productId,
          qty: Number(pQty),
          unitPrice: Number(price),
          description: pDesc || undefined,
        });
      } else {
        if (!serviceId) throw new Error("Selecione um serviço.");
        const price =
          sUnitPrice === ""
            ? services.find((s) => s.id === serviceId)?.price ?? 0
            : Number(sUnitPrice);
        await onConfirm({
          kind,
          serviceId,
          qty: Number(sQty),
          unitPrice: Number(price),
          description: sDesc || undefined,
        });
      }
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Falha ao lançar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Lançar produto/serviço</h3>
          </div>

          <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
            {/* Toggle */}
            <div className="flex gap-3">
              <button
                type="button"
                className={`rounded-xl border px-3 py-1 text-sm ${kind === "product" ? "border-foreground/30" : "border-subtle"}`}
                onClick={() => setKind("product")}
              >
                Produto
              </button>
              <button
                type="button"
                className={`rounded-xl border px-3 py-1 text-sm ${kind === "service" ? "border-foreground/30" : "border-subtle"}`}
                onClick={() => setKind("service")}
              >
                Serviço
              </button>
            </div>

            {kind === "product" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs opacity-70 block">Produto</label>
                  <select
                    className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                    value={productId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setProductId(id);
                      const p = products.find((x) => x.id === id);
                      if (p) setPUnitPrice(p.price);
                    }}
                  >
                    <option value="">Selecione…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {p.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs opacity-70 block">Qtd.</label>
                    <input
                      type="number"
                      min={1}
                      className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                      value={pQty}
                      onChange={(e) => setPQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs opacity-70 block">Preço unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                      value={pUnitPrice}
                      onChange={(e) => setPUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-70 block">Descrição (opcional)</label>
                  <input
                    className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs opacity-70 block">Serviço</label>
                  <select
                    className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                    value={serviceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setServiceId(id);
                      const s = services.find((x) => x.id === id);
                      if (s) setSUnitPrice(s.price);
                    }}
                  >
                    <option value="">Selecione…</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — R$ {s.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs opacity-70 block">Qtd.</label>
                    <input
                      type="number"
                      min={1}
                      className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                      value={sQty}
                      onChange={(e) => setSQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs opacity-70 block">Preço unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                      value={sUnitPrice}
                      onChange={(e) => setSUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs opacity-70 block">Descrição (opcional)</label>
                  <input
                    className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                    value={sDesc}
                    onChange={(e) => setSDesc(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Lançando…" : "Lançar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}