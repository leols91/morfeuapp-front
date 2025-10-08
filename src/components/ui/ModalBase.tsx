// src/components/ui/ModalBase.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/cn";

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
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
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-black/55",
          "backdrop-blur-[2px] supports-[backdrop-filter]:bg-black/35"
        )}
      />
      {/* Container com rolagem */}
      <div className="absolute inset-0 overflow-y-auto grid place-items-center p-4">
        {/* Wrapper do conteúdo (impede fechar ao clicar dentro) */}
        <div onClick={stop} style={{ zIndex: zIndexBase + 1 }}>{children}</div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

/* =========================================
 * Helpers de layout para manter padrão
 * ========================================= */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Classe de largura máxima (Tailwind). Default: "max-w-xl".
   * Aceita qualquer classe válida, ex.:
   *  - "max-w-3xl", "max-w-5xl", "max-w-7xl"
   *  - "max-w-screen-lg", "max-w-screen-xl"
   *  - "max-w-[90vw]" (custom)
   */
  maxWidth?: string;
  /**
   * Largura base do card. Default: "w-full".
   * Útil se quiser algo como "w-auto" combinando com maxWidth.
   */
  widthClass?: string;
};
function Card({
  className,
  maxWidth = "max-w-xl",
  widthClass = "w-full",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        widthClass,
        maxWidth,
        "rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft",
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