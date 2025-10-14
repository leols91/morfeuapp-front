export const UF_CODES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
] as const;
export type UF = (typeof UF_CODES)[number];

export function digitsOnly(v: string | null | undefined): string {
  return (v ?? "").replace(/\D+/g, "");
}

export function isValidCEP(v: string | null | undefined): boolean {
  const d = digitsOnly(v);
  return d.length === 8;
}

export function isValidPhoneBR(v: string | null | undefined): boolean {
  const d = digitsOnly(v);
  // BR: 10 (fixo) ou 11 (celular) dígitos
  return d.length === 10 || d.length === 11;
}

export function isValidCPF(v: string | null | undefined): boolean {
  const s = digitsOnly(v);
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;

  const calc = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factorStart - i);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = calc(s.substring(0, 9), 10);
  const d2 = calc(s.substring(0, 10), 11);
  return d1 === parseInt(s[9], 10) && d2 === parseInt(s[10], 10);
}

export function normalizeUF(v: string | null | undefined): string {
  return (v ?? "").trim().toUpperCase();
}

export const DOC_TYPES = ["", "cpf", "rg", "passport", "other"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export function toDocType(v: unknown): DocType {
  return (DOC_TYPES as readonly string[]).includes(String(v)) ? (v as DocType) : "";
}

/* ============ NOVO: máscaras/sanitizadores ao digitar ============ */

/** Máscara CPF: 000.000.000-00 */
export function maskCPF(v: string): string {
  const d = digitsOnly(v).slice(0, 11);
  const parts = [];
  if (d.length <= 3) return d;
  parts.push(d.slice(0, 3));
  if (d.length <= 6) return `${parts[0]}.${d.slice(3)}`;
  parts.push(d.slice(3, 6));
  if (d.length <= 9) return `${parts[0]}.${parts[1]}.${d.slice(6)}`;
  parts.push(d.slice(6, 9));
  return `${parts[0]}.${parts[1]}.${parts[2]}-${d.slice(9)}`;
}

/** Máscara CEP: 00000-000 */
export function maskCEP(v: string): string {
  const d = digitsOnly(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Máscara Telefone BR (10/11 dígitos). Se + internacional ou >11 dígitos, não mascara. */
export function maskPhoneSmart(v: string): string {
  const trimmed = (v ?? "").replace(/[^\d()+\-.\s]/g, ""); // mantém dígitos e sinais comuns
  if (trimmed.startsWith("+")) {
    // telefone internacional: não aplicar máscara BR
    return trimmed.slice(0, 25);
  }
  const d = digitsOnly(trimmed);
  if (d.length === 0) return "";
  if (d.length > 11) {
    // provavelmente internacional sem + ou algo maior: não mascara, só limpa caracteres estranhos
    return trimmed.slice(0, 25);
  }
  // até 11 dígitos -> mascara BR
  const dd = d.slice(0, 11);
  if (dd.length <= 2) return `(${dd}`;
  if (dd.length <= 6) return `(${dd.slice(0, 2)}) ${dd.slice(2)}`;
  if (dd.length <= 10) return `(${dd.slice(0, 2)}) ${dd.slice(2, 6)}-${dd.slice(6)}`;
  // 11 dígitos (9 no celular)
  return `(${dd.slice(0, 2)}) ${dd.slice(2, 7)}-${dd.slice(7)}`;
}

/** Apenas letras (com acentos), espaço e hífen */
export function lettersOnly(v: string): string {
  return (v ?? "").replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s-]/g, "");
}