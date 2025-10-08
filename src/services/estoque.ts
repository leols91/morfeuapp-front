import { api } from "@/lib/api";

/* =========================
 * Tipos
 * ========================= */
export type ProductCategoryDTO = { id: string; name: string };
export type ProdutoDTO = {
  id: string;
  sku?: string | null;
  name: string;
  unit: string;
  costPrice?: number | null;
  salePrice: number;
  stockControl: boolean;
  categoryId: string;
  category?: ProductCategoryDTO;
  // opcional p/ UI
  currentStock?: number; // calculado por movimentos
  createdAt?: string;
};

export type ListProdutosParams = {
  q?: string;
  categoryId?: string | "all";
  stockControl?: "all" | "controlled" | "not_controlled";
};

export type StockMovementTypeDTO = { code: string; description: string };
export type StockMovementDTO = {
  id: string;
  produtoId: string;
  produto?: Pick<ProdutoDTO, "id" | "name" | "unit" | "sku">;
  typeCode: string; // ex.: "in" | "out"
  quantity: number; // Decimal(12,3)
  unitCost?: number | null;
  note?: string | null;
  createdAt: string;
};

export type CreateProdutoPayload = Omit<
  ProdutoDTO,
  "id" | "category" | "currentStock" | "createdAt"
>;
export type UpdateProdutoPayload = Partial<CreateProdutoPayload>;

export type CreateMovementPayload = {
  produtoId: string;
  typeCode: string;
  quantity: number;
  unitCost?: number | null;
  note?: string | null;
};

/* =========================
 * NOVOS Tipos — Compras em lote
 * ========================= */
export type CompraItem = {
  produtoId: string;
  quantity: number; // positivo
  unitCost: number; // custo unitário
  note?: string | null;
};

export type CreateCompraPayload = {
  supplierId?: string | null;
  note?: string | null;
  items: CompraItem[];
};

/* =========================
 * Categorias
 * ========================= */
export async function listProductCategories(): Promise<ProductCategoryDTO[]> {
  try {
    const { data } = await api.get("/product-categories");
    return data?.data ?? data ?? [];
  } catch {
    return [
      { id: "cat_bar", name: "Bar" },
      { id: "cat_lav", name: "Lavanderia" },
      { id: "cat_minibar", name: "Minibar" },
      { id: "cat_outros", name: "Outros" },
    ];
  }
}

/* =========================
 * Produtos
 * ========================= */
export async function listProdutos(
  params: ListProdutosParams = {}
): Promise<{ data: ProdutoDTO[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.categoryId && params.categoryId !== "all")
    qs.set("categoryId", params.categoryId);
  if (params.stockControl && params.stockControl !== "all")
    qs.set("stockControl", params.stockControl);

  try {
    const { data } = await api.get(`/produtos?${qs.toString()}`);
    return { data: data?.data ?? data ?? [] };
  } catch {
    // mock
    return {
      data: [
        {
          id: "p1",
          sku: "COCA-350",
          name: "Refrigerante Lata 350ml",
          unit: "UN",
          costPrice: 3.2,
          salePrice: 7.0,
          stockControl: true,
          categoryId: "cat_bar",
          category: { id: "cat_bar", name: "Bar" },
          currentStock: 128,
          createdAt: new Date().toISOString(),
        },
        {
          id: "p2",
          sku: "AGUA-SG500",
          name: "Água sem gás 500ml",
          unit: "UN",
          costPrice: 1.8,
          salePrice: 5.0,
          stockControl: true,
          categoryId: "cat_bar",
          category: { id: "cat_bar", name: "Bar" },
          currentStock: 64,
          createdAt: new Date().toISOString(),
        },
        {
          id: "p3",
          sku: "SAB-LV",
          name: "Sabão lavanderia 5kg",
          unit: "KG",
          costPrice: 18.0,
          salePrice: 0,
          stockControl: false,
          categoryId: "cat_lav",
          category: { id: "cat_lav", name: "Lavanderia" },
          currentStock: undefined,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }
}

export async function getProduto(id: string): Promise<ProdutoDTO> {
  try {
    const { data } = await api.get(`/produtos/${id}`);
    return data?.data ?? data;
  } catch {
    return {
      id,
      sku: "MOCK-123",
      name: "Produto Exemplo",
      unit: "UN",
      costPrice: 10,
      salePrice: 20,
      stockControl: true,
      categoryId: "cat_outros",
      category: { id: "cat_outros", name: "Outros" },
      currentStock: 10,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function createProduto(
  payload: CreateProdutoPayload
): Promise<{ id: string }> {
  const { data } = await api.post("/produtos", payload);
  return data?.data ?? data ?? { id: "new_id_mock" };
}

export async function updateProduto(
  id: string,
  payload: UpdateProdutoPayload
): Promise<{ id: string }> {
  const { data } = await api.put(`/produtos/${id}`, payload);
  return data?.data ?? data ?? { id };
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`);
}

/* =========================
 * NOVO: Busca rápida (autocomplete)
 * ========================= */
export async function searchProdutos(q: string): Promise<ProdutoDTO[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  try {
    const { data } = await api.get(`/produtos/search?${qs.toString()}`);
    return data?.data ?? data ?? [];
  } catch {
    // mock simples
    const all: ProdutoDTO[] = [
      {
        id: "p_agua",
        name: "Água Mineral 500ml",
        unit: "UN",
        salePrice: 3.0,
        costPrice: 1.0,
        stockControl: true,
        categoryId: "cat_minibar",
        sku: "AG-500",
      },
      {
        id: "p_coca",
        name: "Coca-Cola Lata 350ml",
        unit: "UN",
        salePrice: 7.0,
        costPrice: 4.2,
        stockControl: true,
        categoryId: "cat_bar",
        sku: "CC-350",
      },
      {
        id: "p_amendoim",
        name: "Amendoim Torrado 100g",
        unit: "UN",
        salePrice: 6.5,
        costPrice: 3.1,
        stockControl: true,
        categoryId: "cat_minibar",
        sku: "AM-100",
      },
      {
        id: "p_biscoito",
        name: "Biscoito Recheado 130g",
        unit: "UN",
        salePrice: 5.0,
        costPrice: 2.5,
        stockControl: true,
        categoryId: "cat_minibar",
        sku: "BI-130",
      },
    ];
    const term = q.trim().toLowerCase();
    if (!term) return all.slice(0, 8);
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
    );
  }
}

/* =========================
 * Movimentos de estoque
 * ========================= */
export async function listMovementTypes(): Promise<StockMovementTypeDTO[]> {
  try {
    const { data } = await api.get("/stock-movement-types");
    return data?.data ?? data ?? [];
  } catch {
    return [
      { code: "in", description: "Entrada (compra/ajuste)" },
      { code: "out", description: "Saída (venda/consumo/ajuste)" },
    ];
  }
}

export async function listStockMovements(params?: {
  produtoId?: string;
}): Promise<{ data: StockMovementDTO[] }> {
  const qs = new URLSearchParams();
  if (params?.produtoId) qs.set("produtoId", params.produtoId);
  try {
    const { data } = await api.get(`/stock-movements?${qs.toString()}`);
    return { data: data?.data ?? data ?? [] };
  } catch {
    // mock: adiciona uma COMPRA agregada (com vários itens) + movimentos normais
    const now = new Date();

    // Compra agregada mock — aparecerá com o botão "Detalhes"
    const purchaseId = "cpr_0001";
    const compraAgregada: any = {
      id: "m_purchase_1",
      produtoId: "mix",           // placeholder
      typeCode: "in",
      quantity: 12 + 24 + 6,      // soma das quantidades dos itens
      unitCost: null,             // não faz sentido unitário no agregado
      note: "Compra consolidada",
      createdAt: now.toISOString(),
      purchaseId,
      purchaseSummary: {
        supplierName: "Atacadão Centro",
        total: 12 * 1.0 + 24 * 4.2 + 6 * 2.5,
      },
    };

    return {
      data: [
        compraAgregada,
        {
          id: "m1",
          produtoId: "p1",
          produto: {
            id: "p1",
            name: "Refrigerante Lata 350ml",
            unit: "UN",
            sku: "COCA-350",
          },
          typeCode: "in",
          quantity: 24,
          unitCost: 3.2,
          note: "Compra fornecedor XPTO",
          createdAt: now.toISOString(),
        },
        {
          id: "m2",
          produtoId: "p1",
          produto: {
            id: "p1",
            name: "Refrigerante Lata 350ml",
            unit: "UN",
            sku: "COCA-350",
          },
          typeCode: "out",
          quantity: 5,
          unitCost: 3.2,
          note: "Vendas/Consumo",
          createdAt: now.toISOString(),
        },
      ],
    };
  }
}

export async function createStockMovement(
  payload: CreateMovementPayload
): Promise<{ id: string }> {
  const { data } = await api.post("/stock-movements", payload);
  return data?.data ?? data ?? { id: "mov_new_mock" };
}

/* =========================
 * NOVO: Registrar compra (itens em lote)
 * ========================= */
export async function createCompra(
  payload: CreateCompraPayload
): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/estoque/compras", payload);
    return data?.data ?? data ?? { id: "compra_mock" };
  } catch {
    // fallback mock
    return { id: `compra_${Math.random().toString(36).slice(2, 8)}` };
  }
}

/* =========================
 * (Opcional) Detalhes da compra — mock completo
 * Use para popular o modal com VÁRIOS itens
 * ========================= */
export async function getCompra(id: string): Promise<{
  id: string;
  supplier?: { legalName: string } | null;
  note?: string | null;
  createdAt: string;
  items: Array<{
    produto: { id: string; name: string; unit: string; sku?: string | null };
    quantity: number;
    unitCost: number;
  }>;
}> {
  try {
    const { data } = await api.get(`/compras/${id}`);
    return data?.data ?? data;
  } catch {
    // se for a compra mock "cpr_0001", devolve itens variados
    if (id === "cpr_0001") {
      const createdAt = new Date().toISOString();
      return {
        id,
        supplier: { legalName: "Atacadão Centro" },
        note: "Compra mensal de reposição",
        createdAt,
        items: [
          {
            produto: { id: "p_agua", name: "Água Mineral 500ml", unit: "UN", sku: "AG-500" },
            quantity: 12,
            unitCost: 1.0,
          },
          {
            produto: { id: "p_coca", name: "Coca-Cola Lata 350ml", unit: "UN", sku: "CC-350" },
            quantity: 24,
            unitCost: 4.2,
          },
          {
            produto: { id: "p_biscoito", name: "Biscoito Recheado 130g", unit: "UN", sku: "BI-130" },
            quantity: 6,
            unitCost: 2.5,
          },
        ],
      };
    }
    // fallback genérico
    return {
      id,
      supplier: null,
      note: null,
      createdAt: new Date().toISOString(),
      items: [],
    };
  }
}

// --- NOVO: Fornecedor ---
export type SupplierDTO = {
  id: string;
  legalName: string;
  documentId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type CreateSupplierPayload = {
  legalName: string;
  documentId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export async function searchSuppliers(q: string): Promise<SupplierDTO[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  try {
    const { data } = await api.get(`/suppliers/search?${qs.toString()}`);
    return data?.data ?? data ?? [];
  } catch {
    // mock básico
    const all: SupplierDTO[] = [
      { id: "sup01", legalName: "Atacadão Centro", documentId: "11.222.333/0001-44", phone: "(11) 3333-4444", email: "contato@atacadao.com" },
      { id: "sup02", legalName: "Mercado Silva", documentId: "22.111.555/0001-20" },
      { id: "sup03", legalName: "Distribuidora Bebidas XYZ", documentId: "10.000.999/0001-77" },
    ];
    const t = q.trim().toLowerCase();
    if (!t) return all.slice(0, 8);
    return all.filter(s => s.legalName.toLowerCase().includes(t) || (s.documentId ?? "").toLowerCase().includes(t));
  }
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/suppliers", payload);
    return data?.data ?? data ?? { id: "sup_mock" };
  } catch {
    // mock
    return { id: `sup_${Math.random().toString(36).slice(2,8)}` };
  }
}