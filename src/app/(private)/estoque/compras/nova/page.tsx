// src/app/estoque/compras/nova/page.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import { Button } from "@/components/ui/Button";
import {
  ProdutoDTO,
  SupplierDTO,
  createAPInvoiceCompra,
  getDefaultPurchaseApCategoryId, // ✅ novo helper para buscar categoria padrão
} from "@/services/estoque";

import { SupplierPicker } from "@/components/compras/SupplierPicker";
import { ProductQuickAdd } from "@/components/compras/ProductQuickAdd";
import { ItemsTable } from "@/components/compras/ItemsTable";
import { QuantityCostModal } from "@/components/compras/QuantityCostModal";
import { CreateProdutoModal } from "@/components/compras/CreateProdutoModal";
import { CreateSupplierModal } from "@/components/compras/CreateSupplierModal";
import { ItemRow, ProductSearchState, SupplierState } from "@/components/compras/types";
import { money, toNum } from "@/components/compras/utils";

/* =========================
 * Página: Nova Compra
 * ========================= */
export default function NovaCompraPage() {
  const router = useRouter();

  // fornecedor
  const [supplierValue, setSupplierValue] = React.useState<SupplierDTO | null>(null);
  const [supplierQuery, setSupplierQuery] = React.useState("");
  const [supplierOpts, setSupplierOpts] = React.useState<SupplierDTO[]>([]);
  const [supplierOpenCreate, setSupplierOpenCreate] = React.useState(false);

  const supplier: SupplierState = {
    value: supplierValue,
    query: supplierQuery,
    options: supplierOpts,
    openCreate: supplierOpenCreate,
    setValue: setSupplierValue,
    setQuery: setSupplierQuery,
    setOptions: setSupplierOpts,
    setOpenCreate: setSupplierOpenCreate,
  };

  // produtos / itens
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [productQuery, setProductQuery] = React.useState("");
  const [productOpts, setProductOpts] = React.useState<ProdutoDTO[]>([]);
  const [productOpenCreate, setProductOpenCreate] = React.useState(false);

  const product: ProductSearchState = {
    query: productQuery,
    options: productOpts,
    openCreate: productOpenCreate,
    setQuery: setProductQuery,
    setOptions: setProductOpts,
    setOpenCreate: setProductOpenCreate,
  };

  // mini-modal de quantidade/custo/total
  const [qcOpen, setQcOpen] = React.useState(false);
  const [qcProduto, setQcProduto] = React.useState<ProdutoDTO | null>(null);

  // observação da compra
  const [note, setNote] = React.useState("");

  // categoria padrão de despesa (buscada das configs da pousada)
  const [defaultApCategoryId, setDefaultApCategoryId] = React.useState<string | null>(null);
  const [loadingDefaultCat, setLoadingDefaultCat] = React.useState(true);

  // vencimento da compra (hoje + 5 dias por padrão)
  const [dueDate, setDueDate] = React.useState(dayjs().add(5, "day").format("YYYY-MM-DD"));

  // totais
  const totalCompra = React.useMemo(
    () => items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0), 0),
    [items]
  );

  // Carrega a categoria padrão ao montar
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingDefaultCat(true);
        const id = await getDefaultPurchaseApCategoryId();
        if (!active) return;
        if (!id) {
          toast.error("Categoria padrão de compras não configurada para a pousada.");
        }
        setDefaultApCategoryId(id);
      } catch (e) {
        console.error(e);
        toast.error("Falha ao carregar a categoria padrão de compras.");
      } finally {
        if (active) setLoadingDefaultCat(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // adicionar item (após escolher/confirmar)
  const addItem = (p: ProdutoDTO, quantity: number, unitCost: number) => {
    const row: ItemRow = {
      id: crypto.randomUUID(),
      produto: p,
      produtoId: p.id,
      unit: p.unit,
      quantity,
      unitCost,
    };
    setItems((prev) => [row, ...prev]);
  };

  // alteração inline na tabela
  const setRowNumber = (rowId: string, k: "quantity" | "unitCost", v: number) => {
    setItems((prev) => prev.map((it) => (it.id === rowId ? { ...it, [k]: v } : it)));
  };
  const removeRow = (rowId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== rowId));
  };

  // submit (criar APInvoice)
  const salvar = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("Adicione pelo menos 1 item.");
      if (!defaultApCategoryId)
        throw new Error("Categoria padrão de compras não encontrada. Verifique as configurações.");

      const payload = {
        supplierId: supplierValue?.id ?? null,
        description: note || "Compra de produtos para estoque",
        dueDate,
        items: items.map((it) => ({
          apCategoryId: defaultApCategoryId,
          produtoId: it.produtoId || null,
          description: it.produto?.name ?? "Produto",
          quantity: String(it.quantity),
          unitCost: String(it.unitCost),
          total: String((it.quantity || 0) * (it.unitCost || 0)),
        })),
      };

      return await createAPInvoiceCompra(payload);
    },
    onSuccess: () => {
      toast.success("Compra registrada e estoque atualizado!");
      router.replace("/estoque/movimentacoes");
    },
    onError: (e: any) => {
      console.error(e);
      toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao registrar compra.");
    },
  });

  /* Handlers escolha/criação de produto */
  const handlePickProduct = (p: ProdutoDTO) => {
    setQcProduto(p);
    setQcOpen(true);
  };
  const handleCreatedProduct = (p: ProdutoDTO) => {
    setProductOpenCreate(false);
    handlePickProduct(p);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova compra</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            onClick={() => salvar.mutate()}
            disabled={salvar.isPending || items.length === 0 || loadingDefaultCat || !defaultApCategoryId}
          >
            {salvar.isPending ? "Salvando…" : "Salvar compra"}
          </Button>
        </div>
      </div>

      {loadingDefaultCat && (
        <div className="surface-2 p-3 text-xs opacity-70">
          Carregando configuração de categoria padrão…
        </div>
      )}

      {/* Fornecedor + Observação */}
      <SupplierPicker
        supplier={supplier}
        note={note}
        setNote={setNote}
        openCreate={() => setSupplierOpenCreate(true)}
      />

      {/* Adicionar itens + total */}
      <ProductQuickAdd
        query={product.query}
        setQuery={product.setQuery}
        options={product.options}
        setOptions={product.setOptions}
        openCreate={() => setProductOpenCreate(true)}
        onPick={handlePickProduct}
        rightTotal={
          <div className="text-right">
            <div className="text-xs opacity-70">Total da compra</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {money(totalCompra)}
            </div>
          </div>
        }
      />

      {/* Tabela de Itens */}
      <ItemsTable items={items} toNum={toNum} setRowNumber={setRowNumber} removeRow={removeRow} />

      {/* Mini-modal Qtde/Custo/Total */}
      {qcOpen && qcProduto && (
        <QuantityCostModal
          open={qcOpen}
          produto={qcProduto}
          onCancel={() => {
            setQcOpen(false);
            setQcProduto(null);
          }}
          onConfirm={(qtd, custo) => {
            if (qtd <= 0) return toast.error("Informe uma quantidade válida.");
            if (custo < 0) return toast.error("Informe um custo válido.");
            addItem(qcProduto, qtd, custo);
            setQcOpen(false);
            setQcProduto(null);
          }}
        />
      )}

      {/* Modais de criação */}
      {productOpenCreate && (
        <CreateProdutoModal
          open={productOpenCreate}
          onClose={() => setProductOpenCreate(false)}
          onCreated={handleCreatedProduct}
        />
      )}
      {supplierOpenCreate && (
        <CreateSupplierModal
          open={supplierOpenCreate}
          onClose={() => setSupplierOpenCreate(false)}
          onCreated={(s) => {
            setSupplierValue(s);
            setSupplierOpenCreate(false);
          }}
        />
      )}
    </div>
  );
}