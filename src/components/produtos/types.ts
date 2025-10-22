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

export type ProductCategoryDTO = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StockMovementDTO = {
  id: string;
  produtoId: string;
  typeCode: string; // "in" | "out" | "adjust"
  quantity: number; // decimal ok no backend; number no FE
  unitCost?: number | null;
  note?: string | null;
  createdAt: string;
  type?: { code: string; description: string };
};

export type ListProdutosParams = {
  q?: string;
  categoryId?: string | "all";
  stockControl?: "all" | "yes" | "no";
};