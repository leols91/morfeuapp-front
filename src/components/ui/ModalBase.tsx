"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/cn";

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  /** Conteúdo do modal. Use os helpers <ModalBase.Card/> <ModalBase.Header/> etc. */
  children: React.ReactNode;
  /** Fecha ao clicar no backdrop (default: true) */
  closeOnBackdrop?: boolean;
  /** Fecha ao pressionar ESC (default: true) */
  closeOnEsc?: boolean;
  /** z-index base do backdrop (o card usa +1). Default: 100000 */
  zIndexBase?: number;
};

export function ModalBase({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  zIndexBase = 100000,
}: ModalBaseProps) {
  // monta portal apenas no client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // ESC para fechar
  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  if (!open || !mounted) return null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const node = (
    <div
      className="fixed inset-0"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: zIndexBase + 0 }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Backdrop com blur real + fallback */}
      <div
        className={cn(
          "absolute inset-0",
          // fallback sólido + leve transparência
          "bg-black/55",
          // quando há suporte a blur, suaviza o fundo e clareia um pouco
          "backdrop-blur-[2px] supports-[backdrop-filter]:bg-black/35"
        )}
      />
      {/* Container central com rolagem quando necessário */}
      <div className="absolute inset-0 overflow-y-auto grid place-items-center p-4">
        {/* Content wrapper: impede fechar ao clicar dentro */}
        <div onClick={stop} style={{ zIndex: zIndexBase + 1 }}>{children}</div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

/* ===============================
 *  Helpers de layout (opcionais)
 *  Mantêm o mesmo “look” de todos os modais
 * =============================== */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Largura máxima (tailwind). Default: max-w-xl */
  maxWidth?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl"
    | "max-w-4xl";
};
function Card({ className, maxWidth = "max-w-xl", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "w-full rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft",
        maxWidth,
        className
      )}
    />
  );
}

type SectionProps = React.HTMLAttributes<HTMLDivElement>;
function Header({ className, ...props }: SectionProps) {
  return (
    <div
      {...props}
      className={cn("px-4 py-3 md:px-6 md:py-4 border-b border-subtle", className)}
    />
  );
}
function Body({ className, ...props }: SectionProps) {
  return (
    <div
      {...props}
      className={cn("px-4 py-4 md:px-6 md:py-6", className)}
    />
  );
}
function Footer({ className, ...props }: SectionProps) {
  return (
    <div
      {...props}
      className={cn("px-4 py-3 md:px-6 md:py-4 border-t border-subtle", className)}
    />
  );
}

ModalBase.Card = Card;
ModalBase.Header = Header;
ModalBase.Body = Body;
ModalBase.Footer = Footer;

export default ModalBase;