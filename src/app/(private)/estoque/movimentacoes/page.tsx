// src/app/estoque/movimentacoes/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Field, Input } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import { listStockMovements, type StockMovementDTO } from "@/services/estoque";
import { cn } from "@/components/ui/cn";
import ModalBase from "@/components/ui/ModalBase";
import { api } from "@/lib/api";

/* =========================================================
 * Tipos locais para compras (detalhes carregados sob demanda)
 * ========================================================= */
type PurchaseItem = {
  produto: { id: string; name: string; unit: string; sku?: string | null };
  quantity: number;
  unitCost: number;
};
type PurchaseDetails = {
  id: string;
  supplierName?: string | null;
  note?: string | null;
  createdAt: string;
  items: PurchaseItem[];
};
type MovementMaybePurchase = StockMovementDTO & {
  purchaseId?: string; // quando vier de uma compra agregada
  // alguns backends já enviam um resumo inline
  purchaseSummary?: {
    supplierName?: string | null;
    items?: Array<{ name: string; quantity: number; unitCost: number }>;
    total?: number;
  };
};

export default function MovimentacoesPage() {
  const [produtoId, setProdutoId] = React.useState<string>("");

  const { data, isLoading, refetch, isFetching } = useQuery<{ data: MovementMaybePurchase[] }>({
    queryKey: ["stock-movements", produtoId || "all"],
    queryFn: () => listStockMovements({ produtoId: produtoId || undefined }) as any,
    refetchOnWindowFocus: false,
  });

  const rows = (data?.data ?? []) as MovementMaybePurchase[];

  // Modal de compra
  const [open, setOpen] = React.useState(false);
  const [loadingPurchase, setLoadingPurchase] = React.useState(false);
  const [purchase, setPurchase] = React.useState<PurchaseDetails | null>(null);

  async function openPurchaseDetails(purchaseId: string, fallbackRow?: MovementMaybePurchase) {
    try {
      setLoadingPurchase(true);
      setOpen(true);
      // tenta API /compras/:id (ajuste o path se for diferente)
      const { data } = await api.get(`/compras/${purchaseId}`);
      const payload: any = data?.data ?? data;

      // mapeia para o tipo local
      const det: PurchaseDetails = {
        id: payload.id ?? purchaseId,
        supplierName: payload.supplier?.legalName ?? payload.supplierName ?? null,
        note: payload.note ?? null,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        items: Array.isArray(payload.items)
          ? payload.items.map((it: any) => ({
              produto: {
                id: it.produto?.id ?? it.produtoId,
                name: it.produto?.name ?? it.produtoName ?? "Produto",
                unit: it.produto?.unit ?? it.unit ?? "UN",
                sku: it.produto?.sku ?? it.sku ?? null,
              },
              quantity: Number(it.quantity ?? 0),
              unitCost: Number(it.unitCost ?? 0),
            }))
          : [],
      };

      setPurchase(det);
    } catch {
      // fallback: mostra ao menos 1 item com a própria linha (caso API ainda não esteja pronta)
      if (fallbackRow) {
        setPurchase({
          id: purchaseId,
          supplierName: fallbackRow.purchaseSummary?.supplierName ?? undefined,
          note: fallbackRow.note ?? undefined,
          createdAt: fallbackRow.createdAt,
          items: [
            {
              produto: {
                id: fallbackRow.produto?.id ?? fallbackRow.produtoId,
                name: fallbackRow.produto?.name ?? "Produto",
                unit: fallbackRow.produto?.unit ?? "UN",
                sku: fallbackRow.produto?.sku,
              },
              quantity: Number(fallbackRow.quantity ?? 0),
              unitCost: Number(fallbackRow.unitCost ?? 0),
            },
          ],
        });
      } else {
        setPurchase(null);
      }
    } finally {
      setLoadingPurchase(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Movimentações de estoque</h1>
        <div className="flex items-center gap-2">
          <Link href={"/estoque/compras/nova" as Route}>
            <Button variant="outline">Nova compra</Button>
          </Link>
          <Link href={"/estoque/movimentacoes/nova" as Route}>
            <Button>Nova movimentação</Button>
          </Link>
        </div>
      </div>

      <div className="surface-2">
        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          <div className="lg:col-span-6">
            <Field label="Filtrar por Produto ID (opcional)">
              <Input
                placeholder="Ex.: p1"
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
              />
            </Field>
          </div>
          <div className="lg:col-span-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setProdutoId("");
                refetch();
              }}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={isLoading || isFetching}>
              {isLoading || isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
          </div>
        </form>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Data</Th>
                <Th>Produto / Compra</Th>
                <Th>Tipo</Th>
                <Th className="text-right">Qtd</Th>
                <Th className="text-right">Custo (un)</Th>
                <Th>Obs.</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((m) => {
                const isPurchaseAgg = Boolean(m.purchaseId);
                return (
                  <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <Td className="whitespace-nowrap">{fmtDateTime(m.createdAt)}</Td>

                    <Td className="truncate max-w-[340px]">
                      {isPurchaseAgg ? (
                        <div className="flex flex-col">
                          <span className="font-medium">Compra #{m.purchaseId?.slice(0, 8)}</span>
                          {m.purchaseSummary?.supplierName ? (
                            <span className="text-[11px] opacity-70">
                              Fornecedor: {m.purchaseSummary.supplierName}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {m.produto?.name ?? m.produtoId} {m.produto?.sku ? `• ${m.produto.sku}` : ""}
                        </>
                      )}
                    </Td>

                    <Td
                      className={cn(
                        m.typeCode === "in"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-rose-600 dark:text-rose-300"
                      )}
                    >
                      {isPurchaseAgg ? "Compra (Entrada)" : m.typeCode === "in" ? "Entrada" : "Saída"}
                    </Td>

                    <Td className="text-right tabular-nums">{m.quantity.toFixed(3)}</Td>
                    <Td className="text-right tabular-nums">{money(m.unitCost)}</Td>
                    <Td className="truncate max-w-[300px]">{m.note ?? "—"}</Td>

                    <Td className="text-right">
                      {isPurchaseAgg ? (
                        <button
                          type="button"
                          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                          title="Ver detalhes da compra"
                          onClick={() => openPurchaseDetails(m.purchaseId!, m)}
                        >
                          Detalhes
                        </button>
                      ) : (
                        <span className="text-xs opacity-50">—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-center py-8 opacity-70">
                    Nenhuma movimentação encontrada
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes da Compra */}
      {open && purchase && (
        <ModalBase open={open} onClose={() => setOpen(false)}>
          <ModalBase.Card maxWidth="max-w-3xl">
            <ModalBase.Header>
              <h3 className="text-lg font-semibold">Detalhes da compra</h3>
              <p className="text-xs opacity-70 mt-0.5">
                ID: {purchase.id} • {fmtDateTime(purchase.createdAt)}
              </p>
              {purchase.supplierName ? (
                <p className="text-xs opacity-70 mt-0.5">Fornecedor: {purchase.supplierName}</p>
              ) : null}
            </ModalBase.Header>

            <ModalBase.Body>
              <div className="grid grid-cols-1 gap-4">
                {purchase.note ? (
                  <div>
                    <div className="text-xs opacity-70">Observação</div>
                    <div className="mt-1">{purchase.note}</div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border-subtle border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr className="text-left">
                        <Th>Produto</Th>
                        <Th>Unid.</Th>
                        <Th className="text-right">Qtde</Th>
                        <Th className="text-right">Custo unit.</Th>
                        <Th className="text-right">Total</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {purchase.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                          <Td className="truncate max-w-[320px]">
                            {it.produto.name} {it.produto.sku ? `• ${it.produto.sku}` : ""}
                          </Td>
                          <Td className="whitespace-nowrap">{it.produto.unit}</Td>
                          <Td className="text-right tabular-nums">{it.quantity.toFixed(3)}</Td>
                          <Td className="text-right tabular-nums">{money(it.unitCost)}</Td>
                          <Td className="text-right tabular-nums">
                            {money(it.quantity * it.unitCost)}
                          </Td>
                        </tr>
                      ))}
                      {purchase.items.length === 0 && (
                        <tr>
                          <Td colSpan={5} className="text-center py-6 opacity-70">
                            Nenhum item para esta compra
                          </Td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-6">
                  <div className="text-right">
                    <div className="text-xs opacity-70">Total da compra</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">
                      {money(
                        purchase.items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ModalBase.Body>

            <ModalBase.Footer className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </ModalBase.Footer>
          </ModalBase.Card>
        </ModalBase>
      )}

      {/* Modal “vazio” enquanto carrega (evita flash) */}
      {open && loadingPurchase && !purchase && (
        <ModalBase open={open} onClose={() => setOpen(false)}>
          <ModalBase.Card maxWidth="max-w-md">
            <ModalBase.Header>
              <h3 className="text-lg font-semibold">Carregando…</h3>
            </ModalBase.Header>
            <ModalBase.Body>
              <div className="text-sm opacity-70">Buscando detalhes da compra…</div>
            </ModalBase.Body>
            <ModalBase.Footer className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
            </ModalBase.Footer>
          </ModalBase.Card>
        </ModalBase>
      )}
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70", props.className)}
    />
  );
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-4 py-3 align-middle", props.className)} />;
}
function money(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}