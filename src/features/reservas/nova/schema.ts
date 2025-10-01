import { z } from "zod";

export const schema = z
  .object({
    hospedeId: z.string().min(1, "Selecione um hóspede"),
    checkIn: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
    alvo: z.string().min(1, "Selecione a acomodação"),
    canalId: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),
    fullyPaid: z.boolean().default(false),
    paymentMethod: z.string().optional(),
  })
  .refine((v) => v.checkIn < v.checkOut, {
    path: ["checkOut"],
    message: "Check-out deve ser após o check-in (dia seguinte ou posterior).",
  })
  .refine((v) => !v.fullyPaid || !!v.paymentMethod, {
    path: ["paymentMethod"],
    message: "Informe a forma de pagamento",
  });

// tipo de entrada para o RHF (evita o problema do default vs required)
export type NovaReservaFormData = z.input<typeof schema>;

// opções fixas
export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão", "Booking", "Airbnb"] as const;