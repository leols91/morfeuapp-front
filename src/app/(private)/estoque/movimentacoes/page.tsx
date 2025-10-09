"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import { listStockMovements, type StockMovementDTO } from "@/services/estoque";
import { api } from "@/lib/api";
import MovimentacoesTable from "@/components/movimentacoes/MovimentacoesTable";
import PurchaseDetailsModal, {
  PurchaseDetails,
} from "@/components/movimentacoes/PurchaseDetailsModal";

export type MovementMaybePurchase = StockMovementDTO & {
  purchaseId?: string;
  purchaseSummary?: {
    supplierName?: string | null;
  };
};

type TipoFiltro = "all" | "entrada" | "saida" | "compra";

export default function MovimentacoesPage() {
  const [produtoId, setProdutoId] = React.useState("");
  const [tipo, setTipo] = React.useState<TipoFiltro>("all");
  const [open, setOpen] = React.useState(false);
  const [purchase, setPurchase] = React.useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = React.useState(false);

  const { data, refetch, isFetching } = useQuery<{ data: MovementMaybePurchase[] }>({
    queryKey: ["stock-movements"],
    queryFn: () => listStockMovements({ produtoId: produtoId || undefined }) as any,
    refetchOnWindowFocus: false,
  });

  const rows = (data?.data ?? []) as MovementMaybePurchase[];

  const filtered = React.useMemo(() => {
    if (tipo === "all") return rows;
    return rows.filter((m) => {
      const isPurchase = Boolean(m.purchaseId);
      if (tipo === "compra") return isPurchase;
      if (isPurchase) return false;
      if (tipo === "entrada") return m.typeCode === "in";
      if (tipo === "saida") return m.typeCode === "out";
      return true;
    });
  }, [rows, tipo]);

  async function openPurchaseDetails(id: string, fallback?: MovementMaybePurchase) {
    setOpen(true);
    setLoading(true);
    try {
      const { data } = await api.get(`/compras/${id}`);
      setPurchase(data.data);
    } catch {
      if (fallback) {
        setPurchase({
          id,
          supplierName: fallback.purchaseSummary?.supplierName ?? "",
          note: fallback.note,
          createdAt: fallback.createdAt,
          items: [
            {
              produto: {
                id: fallback.produtoId,
                name: fallback.produto?.name ?? "Produto",
                unit: fallback.produto?.unit ?? "UN",
              },
              quantity: fallback.quantity,
              unitCost: Number(fallback.unitCost ?? 0),
            },
          ],
        });
      }
    } finally {
      setLoading(false);
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
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
        >
          <div className="lg:col-span-5">
            <Field label="Produto ID (opcional)">
              <Input
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                placeholder="Ex.: p1"
              />
            </Field>
          </div>
          <div className="lg:col-span-3">
            <Field label="Tipo">
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoFiltro)}>
                <option value="all">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="compra">Compra</option>
              </Select>
            </Field>
          </div>
          <div className="lg:col-span-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setProdutoId("");
                setTipo("all");
                refetch();
              }}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
          </div>
        </form>
      </div>

      <MovimentacoesTable rows={filtered} onOpenPurchase={openPurchaseDetails} />

      <PurchaseDetailsModal open={open} onClose={() => setOpen(false)} data={purchase} />
    </div>
  );
}