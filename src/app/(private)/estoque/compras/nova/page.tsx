"use client";
import * as React from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/form/Field";
import ModalBase from "@/components/ui/ModalBase";

import {
  ProdutoDTO,
  SupplierDTO,
  searchProdutos,
  searchSuppliers,
  createProduto,
  createSupplier,
  createCompra,
  type CreateProdutoPayload,
  type CreateSupplierPayload,
} from "@/services/estoque";

/* =========================
 * Utils
 * ========================= */
function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function toNum(v: string) {
  const n = Number((v ?? "").toString().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

type ItemRow = {
  id: string;
  produto: ProdutoDTO;
  produtoId: string;
  unit: string;
  quantity: number;
  unitCost: number;
};

/* =========================
 * Página
 * ========================= */
export default function NovaCompraPage() {
  const router = useRouter();

  // fornecedor
  const [supplier, setSupplier] = React.useState<SupplierDTO | null>(null);
  const [supplierQuery, setSupplierQuery] = React.useState("");
  const [supplierOpts, setSupplierOpts] = React.useState<SupplierDTO[]>([]);
  const [supplierOpenCreate, setSupplierOpenCreate] = React.useState(false);

  // produtos / itens
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [productQuery, setProductQuery] = React.useState("");
  const [productOpts, setProductOpts] = React.useState<ProdutoDTO[]>([]);
  const [productOpenCreate, setProductOpenCreate] = React.useState(false);

  // modal rápido de quantidade/custo
  const [qcOpen, setQcOpen] = React.useState(false);
  const [qcProduto, setQcProduto] = React.useState<ProdutoDTO | null>(null);

  // observação da compra
  const [note, setNote] = React.useState("");

  // busca fornecedor (simples)
  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchSuppliers(supplierQuery);
      if (!active) return;
      setSupplierOpts(r);
    })();
    return () => {
      active = false;
    };
  }, [supplierQuery]);

  // busca produto (simples)
  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchProdutos(productQuery);
      if (!active) return;
      setProductOpts(r);
    })();
    return () => {
      active = false;
    };
  }, [productQuery]);

  // totais
  const totalCompra = React.useMemo(
    () => items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0), 0),
    [items]
  );

  // adicionar item (após escolher/confirmar qc)
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

  // alteração inline (continua possível)
  const setRowNumber = (rowId: string, k: "quantity" | "unitCost", v: number) => {
    setItems((prev) => prev.map((it) => (it.id === rowId ? { ...it, [k]: v } : it)));
  };

  const removeRow = (rowId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== rowId));
  };

  // submit
  const salvar = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("Adicione pelo menos 1 item.");
      const payload = {
        supplierId: supplier?.id ?? null,
        note: note || null,
        items: items.map((it) => ({
          produtoId: it.produtoId,
          quantity: Number(it.quantity) || 0,
          unitCost: Number(it.unitCost) || 0,
        })),
      };
      payload.items.forEach((i, idx) => {
        if (!i.produtoId) throw new Error(`Item ${idx + 1}: selecione o produto.`);
        if (i.quantity <= 0) throw new Error(`Item ${idx + 1}: quantidade inválida.`);
        if (i.unitCost < 0) throw new Error(`Item ${idx + 1}: custo inválido.`);
      });
      return await createCompra(payload);
    },
    onSuccess: () => {
      toast.success("Compra registrada com sucesso!");
      router.replace("/estoque");
    },
    onError: (e: any) => {
      toast.error(e?.message ?? e?.response?.data?.message ?? "Falha ao registrar compra.");
    },
  });

  /* =========================
   * Handlers de seleção/criação de produto
   * ========================= */
  const handlePickProduct = (p: ProdutoDTO) => {
    setQcProduto(p);
    setQcOpen(true); // abre mini modal para informar Qtde/Custo
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
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending || items.length === 0}>
            {salvar.isPending ? "Salvando…" : "Salvar compra"}
          </Button>
        </div>
      </div>

      {/* Fornecedor + Observação */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <Field label="Fornecedor">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Buscar fornecedor…"
                  value={supplier ? supplier.legalName : supplierQuery}
                  onChange={(e) => {
                    setSupplier(null);
                    setSupplierQuery(e.target.value);
                  }}
                  onFocus={() => {
                    if (!supplier) setSupplierQuery((v) => v);
                  }}
                />
                <Button type="button" variant="outline" onClick={() => setSupplierOpenCreate(true)}>
                  Novo
                </Button>
              </div>

              {/* Dropdown fornecedores */}
              {!supplier && supplierQuery.trim() && supplierOpts.length > 0 && (
                <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-64 overflow-auto">
                  {supplierOpts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                      onClick={() => {
                        setSupplier(s);
                        setSupplierQuery("");
                      }}
                    >
                      <div className="font-medium">{s.legalName}</div>
                      <div className="text-[11px] opacity-70">
                        {[s.documentId, s.phone, s.email].filter(Boolean).join(" • ")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <Field label="Observações da compra (opcional)">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="surface">
        {/* Adicionar via busca (MAIS LARGO) */}
        <div className="flex items-end justify-between gap-3">
          <Field label="Adicionar produto">
            <div className="flex gap-2">
              <Input
                className="flex-1 min-w-[420px] md:min-w-[640px]" // 👈 mais largo
                placeholder="Pesquisar produto por nome ou SKU…"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={() => setProductOpenCreate(true)}>
                Novo produto
              </Button>
            </div>

            {/* Sugestões */}
            {productQuery.trim() && productOpts.length > 0 && (
              <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-72 overflow-auto">
                {productOpts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                    onClick={() => {
                      setProductQuery("");
                      handlePickProduct(p);
                    }}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[11px] opacity-70">
                      {p.sku ? `${p.sku} • ` : ""}
                      {p.unit}
                      {typeof p.costPrice === "number" ? ` • custo: ${money(p.costPrice)}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Field>

          {/* Total geral */}
          <div className="text-right">
            <div className="text-xs opacity-70">Total da compra</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{money(totalCompra)}</div>
          </div>
        </div>

        {/* Tabela */}
        <div className="mt-4 overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Produto</Th>
                <Th>Unid.</Th>
                <Th className="text-right">Qtde</Th>
                <Th className="text-right">Custo unit.</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {items.map((it) => {
                const lineTotal = (it.quantity || 0) * (it.unitCost || 0);
                return (
                  <tr key={it.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <Td className="font-medium">{it.produto.name}</Td>
                    <Td className="whitespace-nowrap">{it.unit}</Td>

                    <Td className="text-right">
                      <Input
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={String(it.quantity)}
                        onChange={(e) => setRowNumber(it.id, "quantity", Math.max(0, toNum(e.target.value)))}
                      />
                    </Td>

                    <Td className="text-right">
                      <Input
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={String(it.unitCost)}
                        onChange={(e) => setRowNumber(it.id, "unitCost", Math.max(0, toNum(e.target.value)))}
                      />
                    </Td>

                    <Td className="text-right tabular-nums">{money(lineTotal)}</Td>

                    <Td className="text-right">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        onClick={() => removeRow(it.id)}
                        title="Remover"
                      >
                        Remover
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center py-8 opacity-70">
                    Nenhum item adicionado ainda
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mini-modal: Qtde e Custo unit. */}
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

      {/* Modal: Novo produto (continua igual, mas chama o QC ao final) */}
      {productOpenCreate && (
        <CreateProdutoModal
          open={productOpenCreate}
          onClose={() => setProductOpenCreate(false)}
          onCreated={handleCreatedProduct}
        />
      )}

      {/* Modal: Novo fornecedor (igual) */}
      {supplierOpenCreate && (
        <CreateSupplierModal
          open={supplierOpenCreate}
          onClose={() => setSupplierOpenCreate(false)}
          onCreated={(s) => {
            setSupplier(s);
            setSupplierOpenCreate(false);
          }}
        />
      )}
    </div>
  );
}

/* =========================
 * Subcomponentes utilitários
 * ========================= */
function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70 " + (props.className ?? "")}
    />
  );
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={"px-4 py-3 align-middle " + (props.className ?? "")} />;
}

/** Busca rápida inline (não usada mais nas linhas — mantida se precisar no futuro) */
function InlineProductQuickSearch({
  placeholder,
  onPick,
}: {
  placeholder?: string;
  onPick: (p: ProdutoDTO) => void;
}) {
  const [q, setQ] = React.useState("");
  const [opts, setOpts] = React.useState<ProdutoDTO[]>([]);
  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchProdutos(q);
      if (!active) return;
      setOpts(r);
    })();
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <div>
      <Input placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
      {q.trim() && opts.length > 0 && (
        <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-64 overflow-auto">
          {opts.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => onPick(p)}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-[11px] opacity-70">{[p.sku, p.unit].filter(Boolean).join(" • ")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
 * Mini-modal: Qtde e Custo
 * ========================= */
function QuantityCostModal({
  open,
  produto,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  produto: ProdutoDTO;
  onCancel: () => void;
  onConfirm: (quantity: number, unitCost: number) => void;
}) {
  const [qtd, setQtd] = React.useState<string>("");
  const [custo, setCusto] = React.useState<string>("");

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
            <div className="col-span-6">
              <Field label="Qtde">
                <Input
                  autoFocus
                  inputMode="decimal"
                  value={qtd}
                  onChange={(e) => setQtd(e.target.value)}
                  placeholder="Ex.: 12"
                />
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Custo unit.">
                <Input
                  inputMode="decimal"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  placeholder="Ex.: 1,00"
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(toNum(qtd), toNum(custo))}
          >
            Confirmar
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}

/* =========================
 * Modais de criação rápida
 * ========================= */
const produtoSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  sku: z.string().optional().or(z.literal("")),
  unit: z.string().min(1, "Informe a unidade"),
  salePrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().optional().or(z.nan()).transform((v) => (Number.isNaN(v) ? undefined : v)),
  stockControl: z.enum(["yes", "no"]).default("yes"),
  categoryId: z.string().min(1, "Selecione a categoria"),
});
type ProdutoForm = z.infer<typeof produtoSchema>;

function CreateProdutoModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: ProdutoDTO) => void;
}) {
  const [form, setForm] = React.useState<ProdutoForm>({
    name: "",
    sku: "",
    unit: "UN",
    salePrice: 0,
    costPrice: undefined,
    stockControl: "yes",
    categoryId: "",
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const v = produtoSchema.parse(form);
      const payload: CreateProdutoPayload = {
        name: v.name,
        sku: v.sku || null,
        unit: v.unit,
        salePrice: v.salePrice,
        costPrice: v.costPrice ?? null,
        stockControl: v.stockControl === "yes",
        categoryId: v.categoryId,
      };
      const { id } = await createProduto(payload);
      const novo: ProdutoDTO = {
        id,
        name: payload.name,
        sku: payload.sku ?? undefined,
        unit: payload.unit,
        salePrice: payload.salePrice,
        costPrice: payload.costPrice ?? undefined,
        stockControl: payload.stockControl,
        categoryId: payload.categoryId,
      };
      return novo;
    },
    onSuccess: (p) => {
      toast.success("Produto criado!");
      onCreated(p); // 👈 agora aciona o mini-modal de Qtde/Custo
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar produto."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-2xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Novo produto</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Nome">
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Unidade">
                <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Preço venda">
                <Input
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm((f) => ({ ...f, salePrice: toNum(e.target.value) }))}
                />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Preço custo (opc.)">
                <Input
                  type="number"
                  step="0.01"
                  value={String(form.costPrice ?? "")}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: toNum(e.target.value) }))}
                />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Controle de estoque">
                <select
                  className="form-select"
                  value={form.stockControl}
                  onChange={(e) => setForm((f) => ({ ...f, stockControl: e.target.value as "yes" | "no" }))}
                >
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Categoria (id)">
                <Input
                  placeholder="cat_outros (placeholder simples)"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}

const supplierSchema = z.object({
  legalName: z.string().min(1, "Informe o nome/razão social"),
  documentId: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});
type SupplierForm = z.infer<typeof supplierSchema>;

function CreateSupplierModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (s: SupplierDTO) => void;
}) {
  const [form, setForm] = React.useState<SupplierForm>({
    legalName: "",
    documentId: "",
    email: "",
    phone: "",
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const v = supplierSchema.parse(form);
      const payload: CreateSupplierPayload = {
        legalName: v.legalName,
        documentId: v.documentId || null,
        email: v.email || null,
        phone: v.phone || null,
      };
      const { id } = await createSupplier(payload);
      const novo: SupplierDTO = {
        id,
        legalName: payload.legalName,
        documentId: payload.documentId ?? undefined,
        email: payload.email ?? undefined,
        phone: payload.phone ?? undefined,
      };
      return novo;
    },
    onSuccess: (s) => {
      toast.success("Fornecedor criado!");
      onCreated(s);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar fornecedor."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Novo fornecedor</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Nome/Razão social">
                <Input
                  value={form.legalName}
                  onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Documento (CNPJ/CPF)">
                <Input
                  value={form.documentId ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, documentId: e.target.value }))}
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Telefone">
                <Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-12">
              <Field label="E-mail">
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}