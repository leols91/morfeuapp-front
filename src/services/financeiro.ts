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