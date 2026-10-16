import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { OrderStatus, PaymentMethod, ServiceOrder } from "@/lib/types";

export function TopBar({
  title,
  subtitle,
  backTo,
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-4 backdrop-blur">
      {backTo ? (
        <Link
          to={backTo as never}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export const statusMap: Record<OrderStatus, { label: string; className: string }> = {
  AGENDADO: { label: "Agendado", className: "bg-warning/20 text-warning-foreground" },
  FINALIZADO: { label: "Finalizado", className: "bg-success/15 text-success" },
  CANCELADO: { label: "Cancelado", className: "bg-secondary/12 text-secondary" },
};

export const paymentLabel: Record<PaymentMethod, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CREDITO: "Crédito",
  DEBITO: "Débito",
};

// Pagamento só faz sentido para atendimento finalizado.
export const paymentText = (o: ServiceOrder) =>
  o.status !== "FINALIZADO"
    ? ""
    : o.paid
      ? `Pago${o.paymentMethod ? ` · ${paymentLabel[o.paymentMethod]}` : ""}`
      : "A receber";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = statusMap[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "brand";
}) {
  const tones = {
    default: "bg-card text-card-foreground border border-border",
    accent: "bg-secondary/10 text-foreground border border-secondary/20",
    brand: "bg-brand text-primary-foreground border border-transparent",
  } as const;
  return (
    <div className={`rounded-2xl p-4 shadow-card ${tones[tone]}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] opacity-70">{hint}</p> : null}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/25";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3.5 text-sm font-semibold text-secondary-foreground shadow-float transition-transform active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors active:bg-muted ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
