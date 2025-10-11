import { api } from "@/lib/api";

/* =========================
 * Tipos
 * ========================= */
export type CashAccountDTO = {
  id: string;
  name: string;
  typeCode: string;        // ex: cash, bank
  openingBalance: number;  // Decimal(14,2)
  createdAt?: string;
};

export type CashLedgerDTO = {
  id: string;
  accountId: string;
  entryType: "credit" | "debit";
  amount: number;
  reference?: string | null;
  createdAt: string;
  account?: Pick<CashAccountDTO, "id" | "name" | "typeCode">;
};

export type APInvoiceDTO = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "open" | "paid" | "canceled";
  supplier: { id: string; legalName: string };
  createdAt: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitCost: number;
    total: number;
    produto?: { id: string; name: string; sku?: string | null; unit?: string };
    apCategory?: { id: string; name: string };
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    paidAt: string;
    account: { id: string; name: string };
  }>;
};

export type CreateAccountPayload = {
  name: string;
  typeCode: string;
  openingBalance: number;
};

export type CreateLedgerPayload = {
  accountId: string;
  entryType: "credit" | "debit";
  amount: number;
  reference?: string | null;
};

export type CreateAPInvoicePayload = {
  supplierId: string;
  description: string;
  dueDate: string; // ISO
  items: Array<{ description: string; quantity: number; unitCost: number; produtoId?: string | null; apCategoryId: string }>;
  note?: string | null;
};

export type PayAPInvoicePayload = {
  invoiceId: string;
  accountId: string;
  amount: number;
  paidAt?: string; // ISO
};

/* =========================
 * Contas (CashAccount)
 * ========================= */
export async function listCashAccounts(): Promise<CashAccountDTO[]> {
  try {
    const { data } = await api.get("/cash-accounts");
    return data?.data ?? data ?? [];
  } catch {
    // mock
    return [
      { id: "acc_cash", name: "Caixa", typeCode: "cash", openingBalance: 500, createdAt: new Date().toISOString() },
      { id: "acc_bank", name: "Banco 001", typeCode: "bank", openingBalance: 2500, createdAt: new Date().toISOString() },
    ];
  }
}

export async function createCashAccount(payload: CreateAccountPayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/cash-accounts", payload);
    return data?.data ?? data ?? { id: "acc_new_mock" };
  } catch {
    return { id: `acc_${Math.random().toString(36).slice(2, 8)}` };
  }
}

/* =========================
 * Lançamentos (CashLedger)
 * ========================= */
export async function listCashLedger(params?: { accountId?: string }): Promise<CashLedgerDTO[]> {
  const qs = new URLSearchParams();
  if (params?.accountId) qs.set("accountId", params.accountId);
  try {
    const { data } = await api.get(`/cash-ledger?${qs.toString()}`);
    return data?.data ?? data ?? [];
  } catch {
    const now = new Date();
    return [
      {
        id: "led1",
        accountId: "acc_cash",
        entryType: "credit",
        amount: 350.0,
        reference: "Vendas balcão",
        createdAt: now.toISOString(),
        account: { id: "acc_cash", name: "Caixa", typeCode: "cash" },
      },
      {
        id: "led2",
        accountId: "acc_bank",
        entryType: "debit",
        amount: 120.0,
        reference: "Compras minibar",
        createdAt: now.toISOString(),
        account: { id: "acc_bank", name: "Banco 001", typeCode: "bank" },
      },
    ];
  }
}

export async function createCashLedger(payload: CreateLedgerPayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/cash-ledger", payload);
    return data?.data ?? data ?? { id: "led_new_mock" };
  } catch {
    return { id: `led_${Math.random().toString(36).slice(2, 8)}` };
  }
}

/* =========================
 * Contas a pagar (AP)
 * ========================= */
export async function listAPInvoices(params?: { status?: "all" | "open" | "paid" | "canceled" }): Promise<APInvoiceDTO[]> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== "all") qs.set("status", params.status);
  try {
    const { data } = await api.get(`/ap-invoices?${qs.toString()}`);
    return data?.data ?? data ?? [];
  } catch {
    const today = new Date();
    const due = new Date(today.getTime() + 3 * 86400000);
    return [
      {
        id: "ap1",
        description: "Compra mercadorias minibar",
        amount: 480.0,
        dueDate: due.toISOString(),
        status: "open",
        supplier: { id: "sup02", legalName: "Mercado Silva" },
        createdAt: today.toISOString(),
        items: [
          { id: "it1", description: "Água 500ml", quantity: 24, unitCost: 1, total: 24 },
          { id: "it2", description: "Coca 350ml", quantity: 24, unitCost: 4.2, total: 100.8 },
          { id: "it3", description: "Amendoim 100g", quantity: 20, unitCost: 3.1, total: 62 },
          { id: "it4", description: "Biscoito 130g", quantity: 30, unitCost: 2.5, total: 75 },
          { id: "it5", description: "Outros", quantity: 1, unitCost: 218.2, total: 218.2 },
        ],
        payments: [],
      },
      {
        id: "ap2",
        description: "Conta de energia setembro",
        amount: 1260.55,
        dueDate: new Date(today.getTime() + 7 * 86400000).toISOString(),
        status: "paid",
        supplier: { id: "sup04", legalName: "Concessionária Luz S/A" },
        createdAt: today.toISOString(),
        payments: [
          { id: "pay1", amount: 1260.55, paidAt: today.toISOString(), account: { id: "acc_bank", name: "Banco 001" } },
        ],
      },
    ];
  }
}

export async function createAPInvoice(payload: CreateAPInvoicePayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/ap-invoices", payload);
    return data?.data ?? data ?? { id: "ap_new_mock" };
  } catch {
    return { id: `ap_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function payAPInvoice(payload: PayAPInvoicePayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post(`/ap-invoices/${payload.invoiceId}/pay`, payload);
    return data?.data ?? data ?? { id: "appay_new_mock" };
  } catch {
    return { id: `appay_${Math.random().toString(36).slice(2, 8)}` };
  }
}

// =========================
// CONTAS A RECEBER (AR)
// =========================
export type ARInvoiceDTO = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "open" | "received" | "canceled";
  customer: { id?: string; name: string }; // simples
  createdAt: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  receipts?: Array<{
    id: string;
    amount: number;
    receivedAt: string;
    account: { id: string; name: string };
  }>;
};

export type CreateARInvoicePayload = {
  customer: { id?: string; name: string };
  description: string;
  dueDate: string; // ISO
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  note?: string | null;
};

export type ReceiveARInvoicePayload = {
  invoiceId: string;
  accountId: string;
  amount: number;
  receivedAt?: string; // ISO
};

export async function listARInvoices(params?: {
  status?: "all" | "open" | "received" | "canceled";
}): Promise<ARInvoiceDTO[]> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== "all") qs.set("status", params.status);
  try {
    const { data } = await api.get(`/ar-invoices?${qs.toString()}`);
    return (data?.data ?? data ?? []) as ARInvoiceDTO[];
  } catch {
    // Mocks
    const today = new Date();
    const dueSoon = new Date(today.getTime() + 3 * 86400000);
    return [
      {
        id: "ar1",
        description: "Reembolso evento corporativo",
        amount: 850.0,
        dueDate: dueSoon.toISOString(),
        status: "open",
        customer: { name: "Empresa ABC Ltda" },
        createdAt: today.toISOString(),
        items: [
          { id: "arit1", description: "Coffee break", quantity: 1, unitPrice: 350, total: 350 },
          { id: "arit2", description: "Locação salão", quantity: 1, unitPrice: 500, total: 500 },
        ],
        receipts: [],
      },
      {
        id: "ar2",
        description: "Prestação de serviço — mini evento",
        amount: 420.0,
        dueDate: new Date(today.getTime() - 2 * 86400000).toISOString(),
        status: "received",
        customer: { name: "Associação Amigos do Parque" },
        createdAt: today.toISOString(),
        items: [{ id: "arit3", description: "Locação espaço", quantity: 1, unitPrice: 420, total: 420 }],
        receipts: [
          {
            id: "rcv1",
            amount: 420,
            receivedAt: today.toISOString(),
            account: { id: "acc_cash", name: "Caixa" },
          },
        ],
      },
    ];
  }
}

export async function createARInvoice(payload: CreateARInvoicePayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/ar-invoices", payload);
    return data?.data ?? data ?? { id: "ar_new_mock" };
  } catch {
    return { id: `ar_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function receiveARInvoice(payload: ReceiveARInvoicePayload): Promise<{ id: string }> {
  try {
    const { data } = await api.post(`/ar-invoices/${payload.invoiceId}/receive`, payload);
    return data?.data ?? data ?? { id: "arrecv_new_mock" };
  } catch {
    return { id: `arrecv_${Math.random().toString(36).slice(2, 8)}` };
  }
}

// --- Tipos ---
export type APCategoryDTO = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
};

// --- Categorias de despesa (APCategory) ---
export async function listAPCategories(): Promise<APCategoryDTO[]> {
  try {
    const { data } = await api.get("/ap-categories");
    return data?.data ?? data ?? [];
  } catch {
    // mock
    return [
      { id: "cat_insumos", name: "Insumos", description: "Compras de insumos", createdAt: new Date().toISOString() },
      { id: "cat_utilidades", name: "Utilidades", description: "Energia, água, internet…", createdAt: new Date().toISOString() },
      { id: "cat_servicos", name: "Serviços", description: "Serviços contratados", createdAt: new Date().toISOString() },
    ];
  }
}

export async function createAPCategory(payload: { name: string; description?: string | null }): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/ap-categories", payload);
    return data?.data ?? data ?? { id: "cat_new_mock" };
  } catch {
    return { id: `cat_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function updateAPCategory(
  id: string,
  payload: { name: string; description?: string | null }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/ap-categories/${id}`, payload);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

export async function deleteAPCategory(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/ap-categories/${id}`);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}
// =========================
// Receitas: Categorias (AR / Revenue)
// =========================
export type RevenueCategoryDTO = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
};

export async function listRevenueCategories(): Promise<RevenueCategoryDTO[]> {
  try {
    const { data } = await api.get("/ar-categories");
    return data?.data ?? data ?? [];
  } catch {
    // mock
    return [
      { id: "rev_hospedagem", name: "Hospedagem", description: "Receitas de diárias", createdAt: new Date().toISOString() },
      { id: "rev_consumo", name: "Consumos", description: "Consumos internos / frigobar / bar", createdAt: new Date().toISOString() },
      { id: "rev_eventos", name: "Eventos", description: "Locações e eventos", createdAt: new Date().toISOString() },
    ];
  }
}

export async function createRevenueCategory(payload: { name: string; description?: string | null }): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/ar-categories", payload);
    return data?.data ?? data ?? { id: "rev_new_mock" };
  } catch {
    return { id: `rev_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function updateRevenueCategory(
  id: string,
  payload: { name: string; description?: string | null }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/ar-categories/${id}`, payload);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

export async function deleteRevenueCategory(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/ar-categories/${id}`);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

// =========================
// Unificado: Categorias (Receita / Despesa)
// =========================
export type FinanceCategoryDTO = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  kind: "expense" | "revenue";
};

// Lista unificada (busca as duas coleções e normaliza)
export async function listFinanceCategories(): Promise<FinanceCategoryDTO[]> {
  const [ap, ar] = await Promise.all([listAPCategories(), listRevenueCategories()]);
  const mapAP = ap.map((c) => ({ ...c, kind: "expense" as const }));
  const mapAR = ar.map((c) => ({ ...c, kind: "revenue" as const }));
  return [...mapAP, ...mapAR].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

// Create
export async function createFinanceCategory(payload: {
  name: string;
  description?: string | null;
  kind: "expense" | "revenue";
}): Promise<{ id: string }> {
  if (payload.kind === "expense") {
    return await createAPCategory({ name: payload.name, description: payload.description ?? null });
  }
  return await createRevenueCategory({ name: payload.name, description: payload.description ?? null });
}

// Update (precisa saber o kind atual)
export async function updateFinanceCategory(
  id: string,
  kind: "expense" | "revenue",
  payload: { name: string; description?: string | null }
): Promise<{ id: string }> {
  if (kind === "expense") {
    return await updateAPCategory(id, { name: payload.name, description: payload.description ?? null });
  }
  return await updateRevenueCategory(id, { name: payload.name, description: payload.description ?? null });
}

// Delete (precisa saber o kind atual)
export async function deleteFinanceCategory(id: string, kind: "expense" | "revenue"): Promise<{ id: string }> {
  if (kind === "expense") return await deleteAPCategory(id);
  return await deleteRevenueCategory(id);
}

export async function updateCashAccount(
  id: string,
  payload: { name: string; typeCode: string; openingBalance: number }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/cash-accounts/${id}`, payload);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

export async function deleteCashAccount(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/cash-accounts/${id}`);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}


/* =========================
 * Métodos de pagamento
 * ========================= */
export type PaymentMethodDTO = {
  code: string;           // PK (ex.: PIX, DINHEIRO, CARTAO_CREDITO)
  description: string;
  createdAt?: string;
};

export async function listPaymentMethods(params?: { q?: string }): Promise<PaymentMethodDTO[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  try {
    const { data } = await api.get(`/payment-methods?${qs.toString()}`);
    return data?.data ?? data ?? [];
  } catch {
    // mock
    return [
      { code: "DINHEIRO", description: "Dinheiro", createdAt: new Date().toISOString() },
      { code: "PIX", description: "Pix", createdAt: new Date().toISOString() },
      { code: "CARTAO_CREDITO", description: "Cartão de crédito", createdAt: new Date().toISOString() },
    ];
  }
}

export async function createPaymentMethod(payload: {
  code: string;
  description: string;
}): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/payment-methods", payload);
    const id = data?.data?.code ?? data?.code ?? payload.code;
    return { id };
  } catch {
    return { id: payload.code };
  }
}

export async function updatePaymentMethod(
  code: string,
  payload: { description: string }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/payment-methods/${code}`, payload);
    const id = data?.data?.code ?? data?.code ?? code;
    return { id };
  } catch {
    return { id: code };
  }
}

export async function deletePaymentMethod(code: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/payment-methods/${code}`);
    const id = data?.data?.code ?? data?.code ?? code;
    return { id };
  } catch {
    return { id: code };
  }
}