import {
  listPousadaConfigs,
  createPousadaConfig,
  updatePousadaConfig,
  listUserConfigs,
  createUserConfig,
  updateUserConfig,
  type PousadaConfigDTO,
  type UserConfigDTO,
} from "@/services/configs";

/** Mapa de chaves amigáveis -> chaves persistidas */
export const KEYS = {
  // Geral
  pousada_name: "pousada_name",
  pousada_trade_name: "pousada_trade_name",
  pousada_phone: "pousada_phone",
  pousada_email: "pousada_email",
  pousada_address: "pousada_address",

  // Regras
  checkin_time: "checkin_time",         // "14:00"
  checkout_time: "checkout_time",       // "12:00"
  child_free_until_age: "child_free_until_age", // "5"
  allow_child_in_shared: "allow_child_in_shared", // "true"|"false"

  // Canais
  channel_enabled_booking: "channel_booking_enabled",
  channel_commission_booking: "channel_booking_commission_percent",
  channel_enabled_airbnb: "channel_airbnb_enabled",
  channel_commission_airbnb: "channel_airbnb_commission_percent",
  channel_enabled_expedia: "channel_expedia_enabled",
  channel_commission_expedia: "channel_expedia_commission_percent",

  // Financeiro
  default_receivable_account: "default_receivable_account",
  default_payable_account: "default_payable_account",
  default_payment_method: "default_payment_method",

  // Políticas de reserva
  cancel_free_days: "cancel_free_days",
  no_show_penalty_percent: "no_show_penalty_percent",
  refund_policy: "refund_policy", // "total|partial|none"

  // Mensagens
  message_welcome: "message_welcome",
  message_checkout: "message_checkout",
  message_billing: "message_billing",
  whatsapp_link: "whatsapp_link",

  // Integrações
  smtp_host: "smtp_host",
  smtp_port: "smtp_port",
  smtp_user: "smtp_user",
  smtp_pass: "smtp_pass",

  // Aparência
  theme_color: "theme_color",
  default_language: "default_language",
  default_page_size: "default_page_size",
} as const;

type KV = Record<string, string | null | undefined>;

/** Carrega todos os pares chave/valor (pousada) como objeto */
export async function getPousadaConfigObject(): Promise<Record<string, string>> {
  const rows = (await listPousadaConfigs()) as PousadaConfigDTO[];
  const o: Record<string, string> = {};
  rows.forEach((r) => (o[r.configName] = r.configValue ?? ""));
  return o;
}

/** Upsert em lote (pousada) */
export async function upsertPousadaConfigs(payload: KV) {
  const existing = (await listPousadaConfigs()) as PousadaConfigDTO[];
  const byName = new Map(existing.map((r) => [r.configName, r]));

  for (const [configName, rawValue] of Object.entries(payload)) {
    if (rawValue === undefined) continue;
    const configValue = String(rawValue ?? "");
    const found = byName.get(configName);
    if (found) {
      await updatePousadaConfig(found.id, { configName, configValue });
    } else {
      await createPousadaConfig({ configName, configValue });
    }
  }
}

/** Carrega todos os pares chave/valor (usuário) como objeto */
export async function getUserConfigObject(): Promise<Record<string, string>> {
  const rows = (await listUserConfigs()) as UserConfigDTO[];
  const o: Record<string, string> = {};
  rows.forEach((r) => (o[r.userConfigName] = r.userConfigValue ?? ""));
  return o;
}

/** Upsert em lote (usuário) */
export async function upsertUserConfigs(payload: KV) {
  const existing = (await listUserConfigs()) as UserConfigDTO[];
  const byName = new Map(existing.map((r) => [r.userConfigName, r]));

  for (const [userConfigName, rawValue] of Object.entries(payload)) {
    if (rawValue === undefined) continue;
    const userConfigValue = String(rawValue ?? "");
    const found = byName.get(userConfigName);
    if (found) {
      await updateUserConfig(found.id, { userConfigName, userConfigValue });
    } else {
      await createUserConfig({ userConfigName, userConfigValue });
    }
  }
}