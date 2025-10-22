"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Field, Select } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import {
  listProdutos,
  listStockMovements,
  type ProdutoDTO,
  type StockMovementDTO,
} from "@/services/estoque";
import { api } from "@/lib/api";
import MovimentacoesTable from "@/components/movimentacoes/MovimentacoesTable";
import PurchaseDetailsModal, { PurchaseDetails } from "@/components/movimentacoes/PurchaseDetailsModal";

export type MovementMaybePurchase = StockMovementDTO & {
  purchaseId?: string;
  purchaseSummary?: { supplierName?: string | null };
};

type TipoFiltro = "all" | "entrada" | "saida" | "compra";

const PAGE_SIZE = 20;

export default function MovimentacoesPage() {
  const [produtoId, setProdutoId] = React.useState<string>("");
  const [tipo, setTipo] = React.useState<TipoFiltro>("all");
  const [open, setOpen] = React.useState(false);
  const [purchase, setPurchase] = React.useState<PurchaseDetails | null>(null);

  // paginação quando está em "Todos"
  const [page, setPage] = React.useState(1);
  const [accRows, setAccRows] = React.useState<MovementMaybePurchase[]>([]);
  const [hasMore, setHasMore] = React.useState(false);

  // Produtos para o select
  const produtosQ = useQuery<ProdutoDTO[]>({
    queryKey: ["produtos_for_mov_list"],
    queryFn: async () => {
      const res = await listProdutos({});
      return res.data; // retorna direto o array
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Movimentações:
  // - Se tiver produtoId: usa rota por produto
  // - Senão: usa rota geral paginada
  const {
    data: queryPayload,
    isFetching,
    refetch,
  } = useQuery<{
    rows: MovementMaybePurchase[];
    hasMore: boolean;
  }>({
    queryKey: ["stock-movements", produtoId, page],
    queryFn: async () => {
      if (produtoId) {
        const res = await listStockMovements({ produtoId });
        const rows = (res.data ?? []) as MovementMaybePurchase[];
        return { rows, hasMore: false };
      }
      const { data } = await api.get(`/stock-movements`, {
        params: { page, limit: PAGE_SIZE },
      });

      // Aceita vários formatos de retorno:
      const payload = data?.data ?? data ?? {};
      const items: unknown =
        Array.isArray(payload)
          ? payload
          : payload.items ?? payload.rows ?? payload.result ?? payload.data ?? [];

      const rows = (Array.isArray(items) ? items : []) as MovementMaybePurchase[];
      const more =
        Boolean((payload as any)?.hasMore) ||
        Boolean((payload as any)?.meta?.hasMore) ||
        rows.length === PAGE_SIZE;

      return { rows, hasMore: more };
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Acumula/atualiza a lista quando está em "Todos"
  React.useEffect(() => {
    if (!queryPayload) return;
    if (produtoId) {
      // modo por produto: não acumula, usa diretamente
      setAccRows(queryPayload.rows);
      setHasMore(false);
    } else {
      // modo "Todos": acumula por páginas
      setAccRows((prev) => (page === 1 ? queryPayload.rows : [...prev, ...queryPayload.rows]));
      setHasMore(queryPayload.hasMore);
    }
  }, [queryPayload, produtoId, page]);

  // Conjunto de linhas que será exibido
  const baseRows = produtoId ? (queryPayload?.rows ?? []) : accRows;

  // Filtro de tipo client-side
  const filtered = React.useMemo(() => {
    if (tipo === "all") return baseRows;
    return baseRows.filter((m) => {
      const isPurchase = Boolean(m.purchaseId);
      if (tipo === "compra") return isPurchase;
      if (isPurchase) return false;
      if (tipo === "entrada") return m.typeCode === "in";
      if (tipo === "saida") return m.typeCode === "out";
      return true;
    });
  }, [baseRows, tipo]);

  async function openPurchaseDetails(id: string, fallback?: MovementMaybePurchase) {
    setOpen(true);
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
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Filtros */}
      <div className="surface-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // ao aplicar, volta para a página 1 quando estiver em "Todos"
            if (!produtoId) setPage(1);
            refetch();
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
        >
          <div className="lg:col-span-5">
            <Field label="Produto">
              <Select
                value={produtoId}
                onChange={(e) => {
                  const next = e.target.value;
                  setProdutoId(next);
                  // reset de paginação/acúmulo ao trocar o modo
                  setPage(1);
                  setAccRows([]);
                }}
                disabled={produtosQ.isLoading || produtosQ.isError}
              >
                <option value="">{produtosQ.isLoading ? "Carregando…" : "Todos"}</option>
                {(produtosQ.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `• ${p.sku}` : ""}
                  </option>
                ))}
              </Select>
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
                setPage(1);
                setAccRows([]);
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

      {/* Lista / Paginação */}
      {isFetching && page === 1 && (
        <div className="surface p-6 text-sm opacity-70">Carregando movimentações…</div>
      )}

      {!isFetching || page > 1 ? (
        <>
          <MovimentacoesTable rows={filtered} onOpenPurchase={openPurchaseDetails} />

          {/* Paginação: só no modo "Todos" */}
          {!produtoId && hasMore && (
            <div className="flex justify-center mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (!isFetching) setPage((p) => p + 1);
                }}
              >
                {isFetching ? "Carregando…" : "Carregar mais"}
              </Button>
            </div>
          )}
        </>
      ) : null}

      <PurchaseDetailsModal open={open} onClose={() => setOpen(false)} data={purchase} />
    </div>
  );
}