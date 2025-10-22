import { api } from "@/lib/api";
import { getActivePousadaId } from "@/lib/tenants";

/* =========================
 * Tipos básicos (FE)
 * ========================= */
export type ProdutoDTO = {
  id: string;
  sku?: string | null;
  name: string;
  unit: string;
  costPrice?: number | null;
  salePrice: number;
  stockControl: boolean;
  categoryId: string;
  category?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCategoryDTO = { id: string; name: string };

export type StockMovementDTO = {
  id: string;
  produtoId: string;
  typeCode: "in" | "out";
  quantity: number;
  unitCost?: number | null;
  note?: string | null;
  createdAt: string;
  produto?: { id: string; name: string; unit: string };
  type?: { code: string; description: string };
};

export type ListProdutosParams = {
  q?: string;
  categoryId?: string | "all";
  stockControl?: "all" | "controlled" | "not_controlled";
};

/* =========================
 * Produtos
 * ========================= */
export async function listProdutos(
  params?: ListProdutosParams
): Promise<{ data: ProdutoDTO[] }> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return { data: [] };

  const { data } = await api.get(`/pousadas/${pousadaId}/produtos`);
  let list: ProdutoDTO[] = data ?? [];

  // Filtros no frontend
  if (params) {
    const q = (params.q ?? "").toLowerCase();
    list = list.filter((p) => {
      if (q) {
        const hay = [p.name, p.sku ?? "", p.category?.name ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (params.categoryId && params.categoryId !== "all") {
        if (p.categoryId !== params.categoryId) return false;
      }
      if (params.stockControl && params.stockControl !== "all") {
        const want = params.stockControl === "controlled";
        if (!!p.stockControl !== want) return false;
      }
      return true;
    });
  }

  return { data: list };
}

/** 🔎 Busca rápida de produtos (usada no ProductQuickAdd) */
export async function searchProdutos(q: string): Promise<ProdutoDTO[]> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return [];

  const { data } = await api.get(`/pousadas/${pousadaId}/produtos`);
  const list: ProdutoDTO[] = data ?? [];

  if (!q) return list;
  const query = q.toLowerCase();

  return list.filter((p) =>
    [p.name, p.sku ?? "", p.category?.name ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

/* =========================
 * CRUD de produtos
 * ========================= */
export async function getProduto(id: string): Promise<ProdutoDTO> {
  const { data } = await api.get(`/produtos/${id}`);
  return data;
}

export async function createProduto(body: {
  categoryId: string;
  sku?: string | null;
  name: string;
  unit: string;
  costPrice?: number | null;
  salePrice: number;
  stockControl: boolean;
}) {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não encontrada.");
  const { data } = await api.post(`/pousadas/${pousadaId}/produtos`, body);
  return data;
}

export async function updateProduto(
  id: string,
  body: Partial<{
    categoryId: string;
    sku?: string | null;
    name: string;
    unit: string;
    costPrice?: number | null;
    salePrice: number;
    stockControl: boolean;
  }>
) {
  const { data } = await api.patch(`/produtos/${id}`, body);
  return data;
}

export async function deleteProduto(id: string) {
  await api.delete(`/produtos/${id}`);
}

/* =========================
 * Categorias de produto
 * ========================= */
export async function listProductCategories(): Promise<ProductCategoryDTO[]> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return [];
  const { data } = await api.get(`/pousadas/${pousadaId}/product-categories`);
  return data ?? [];
}

export async function createProductCategory(name: string) {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não encontrada.");
  const { data } = await api.post(`/pousadas/${pousadaId}/product-categories`, {
    name,
  });
  return data;
}

export async function updateProductCategory(id: string, name: string) {
  const { data } = await api.patch(`/product-categories/${id}`, { name });
  return data;
}

export async function deleteProductCategory(id: string) {
  await api.delete(`/product-categories/${id}`);
}

/* =========================
 * Movimentações de estoque
 * ========================= */
export async function listMovementTypes(): Promise<
  { code: "in" | "out"; description: string }[]
> {
  return [
    { code: "in", description: "Entrada" },
    { code: "out", description: "Saída" },
  ];
}

export async function listStockMovements(params: { produtoId?: string }) {
  if (!params?.produtoId) return { data: [] as StockMovementDTO[] };
  const { data } = await api.get(`/produtos/${params.produtoId}/stock-movements`);
  return { data: data as StockMovementDTO[] };
}

export async function createStockMovement(body: {
  produtoId: string;
  typeCode: "in" | "out";
  quantity: number;
  unitCost?: number | null;
  note?: string | null;
}) {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não encontrada.");

  const { data } = await api.post(`/pousadas/${pousadaId}/stock-movements`, {
    productId: body.produtoId,
    typeCode: body.typeCode,
    quantity: body.quantity,
    unitCost: body.unitCost ?? null,
    note: body.note ?? null,
  });
  return data;
}

export async function deleteStockMovement(movementId: string) {
  await api.delete(`/stock-movements/${movementId}`);
}

export async function createAPInvoiceCompra(body: {
  supplierId: string | null;
  description: string;
  dueDate: string;
  items: {
    apCategoryId: string;
    produtoId: string | null;
    description: string;
    quantity: string;
    unitCost: string;
    total: string;
  }[];
}) {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não encontrada.");
  const { data } = await api.post(`/pousadas/${pousadaId}/ap-invoices`, body);
  return data;
}

export type SupplierDTO = {
  id: string;
  legalName: string;
  documentId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export async function listSuppliers(): Promise<SupplierDTO[]> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return [];
  const { data } = await api.get(`/pousadas/${pousadaId}/suppliers`);
  return data ?? [];
}

export async function getSupplierById(id: string): Promise<SupplierDTO> {
  const { data } = await api.get(`/suppliers/${id}`);
  return data;
}

export async function createSupplier(body: {
  legalName: string;
  documentId?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não encontrada.");
  const { data } = await api.post(`/pousadas/${pousadaId}/suppliers`, body);
  return data;
}

export async function updateSupplier(
  id: string,
  body: Partial<{ legalName: string; documentId?: string | null; email?: string | null; phone?: string | null }>
) {
  const { data } = await api.patch(`/suppliers/${id}`, body);
  return data;
}

export async function deleteSupplier(id: string) {
  await api.delete(`/suppliers/${id}`);
}

/** opcional: busca local por nome/documento/email/telefone */
export async function searchSuppliersLocal(q: string): Promise<SupplierDTO[]> {
  const list = await listSuppliers();
  if (!q) return list;
  const s = q.toLowerCase();
  return list.filter((x) =>
    [x.legalName, x.documentId ?? "", x.email ?? "", x.phone ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(s)
  );
}
export const searchSuppliers = searchSuppliersLocal;

export type PousadaConfigDTO = {
  id: string;
  configName: string;
  configValue: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Lista todas as configs da pousada */
export async function listPousadaConfigs(): Promise<PousadaConfigDTO[]> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return [];
  const { data } = await api.get(`/pousadas/${pousadaId}/configs`);
  // backend já retorna array direto
  return data ?? [];
}

/** Helper para pegar a config default de categoria de compra */
export async function getDefaultPurchaseApCategoryId(): Promise<string | null> {
  const configs = await listPousadaConfigs();
  const found = configs.find(c => c.configName === "default_purchase_ap_category_id");
  return found?.configValue ?? null;
}