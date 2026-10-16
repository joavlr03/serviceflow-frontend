import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/app/PhoneShell";
import { StatCard, TopBar } from "@/components/app/ui-bits";
import { PaymentDrawer } from "@/components/app/PaymentDrawer";
import { useStore } from "@/lib/store";
import { brl, formatDate, startOfMonthISO, startOfWeekISO, todayISO } from "@/lib/format";
import { exportarPeriodo } from "@/lib/export-excel";
import type { ServiceOrder } from "@/lib/types";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Dashboard financeiro | ServiceFlow" },
      {
        name: "description",
        content: "Receita prevista, receita realizada, despesas, lucro e ticket médio por período.",
      },
      { property: "og:title", content: "Dashboard financeiro | ServiceFlow" },
      {
        property: "og:description",
        content: "Acompanhe faturamento, despesas e lucro do seu negócio.",
      },
    ],
  }),
  component: Financeiro,
});

type Period = "hoje" | "semana" | "mes";

function Financeiro() {
  const { company, orders, expenses, clientById, vehicleById, serviceById } = useStore();
  const [period, setPeriod] = useState<Period>("mes");
  const [exporting, setExporting] = useState(false);

  const from =
    period === "hoje" ? todayISO() : period === "semana" ? startOfWeekISO() : startOfMonthISO();
  const to = todayISO();

  const data = useMemo(() => {
    const inRange = (d: string) => d >= from && (period === "hoje" ? d <= to : true);
    const os = orders.filter((o) => inRange(o.date));
    const finished = os.filter((o) => o.status === "FINALIZADO");
    const scheduled = os.filter((o) => o.status === "AGENDADO");
    const canceled = os.filter((o) => o.status === "CANCELADO");
    const realized = finished.reduce((s, o) => s + o.price, 0);
    const forecast = realized + scheduled.reduce((s, o) => s + o.price, 0);
    const periodExpenses = expenses.filter((e) => inRange(e.date));
    const exp = periodExpenses.reduce((s, e) => s + e.amount, 0);

    const byService = new Map<string, { count: number; total: number }>();
    finished.forEach((o) => {
      const name = serviceById(o.serviceId)?.name ?? "Serviço";
      const cur = byService.get(name) ?? { count: 0, total: 0 };
      byService.set(name, { count: cur.count + 1, total: cur.total + o.price });
    });

    return {
      os,
      periodExpenses,
      realized,
      forecast,
      exp,
      profit: realized - exp,
      finished: finished.length,
      canceled: canceled.length,
      ticket: finished.length ? realized / finished.length : 0,
      ranking: [...byService.entries()].sort((a, b) => b[1].total - a[1].total),
    };
  }, [orders, expenses, from, to, period, serviceById]);

  const max = data.ranking[0]?.[1].total ?? 1;

  // "A receber" ignora o filtro de período: um fiado antigo continua devendo.
  const pending = useMemo(
    () =>
      orders
        .filter((o) => o.status === "FINALIZADO" && !o.paid)
        .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)),
    [orders],
  );
  const pendingTotal = pending.reduce((s, o) => s + o.price, 0);
  const [paying, setPaying] = useState<ServiceOrder | null>(null);

  return (
    <PhoneShell fab={false}>
      <TopBar title="Financeiro" subtitle="Receitas, despesas e lucro" />

      <div className="flex gap-2 px-5 pt-4">
        {(
          [
            ["hoje", "Hoje"],
            ["semana", "Semana"],
            ["mes", "Mês"],
          ] as Array<[Period, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
              period === key
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-3">
        <button
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              await exportarPeriodo({
                company,
                from,
                to,
                orders: data.os,
                expenses: data.periodExpenses,
                summary: data,
                clientById,
                vehicleById,
                serviceById,
              });
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Não foi possível gerar a planilha",
              );
            } finally {
              setExporting(false);
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-2 text-xs font-semibold text-foreground disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Gerando planilha..." : "Exportar período para Excel"}
        </button>
      </div>

      <section className="px-5 pt-4">
        <div className="rounded-2xl bg-brand p-5 text-primary-foreground shadow-card">
          <p className="text-[11px] uppercase tracking-wide opacity-70">Lucro do período</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{brl(data.profit)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
              <ArrowUpRight className="h-4 w-4" />
              <div>
                <p className="opacity-70">Realizado</p>
                <p className="text-sm font-bold">{brl(data.realized)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
              <ArrowDownRight className="h-4 w-4" />
              <div>
                <p className="opacity-70">Despesas</p>
                <p className="text-sm font-bold">{brl(data.exp)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-4">
        <StatCard label="Receita prevista" value={brl(data.forecast)} tone="accent" />
        <StatCard label="Ticket médio" value={brl(data.ticket)} />
        <StatCard label="Serviços concluídos" value={String(data.finished)} />
        <StatCard
          label="Cancelamentos"
          value={String(data.canceled)}
          hint="Não entram na receita"
        />
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold">A receber</h2>
          <span className="text-sm font-bold">{brl(pendingTotal)}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-card">
          {pending.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 border-b border-border p-3.5 last:border-0"
            >
              <Link to="/os/$osId" params={{ osId: o.id }} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {clientById(o.clientId)?.name ?? "Cliente"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.code} • {formatDate(o.date)} • {brl(o.price)}
                </p>
              </Link>
              <button
                onClick={() => setPaying(o)}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
              >
                Recebido
              </button>
            </div>
          ))}
          {pending.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              Nenhum atendimento a receber.
            </p>
          ) : null}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Atendimentos finalizados e ainda não pagos, de qualquer período.
        </p>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold">Serviços mais vendidos</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          {data.ranking.map(([name, v]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{name}</span>
                <span className="text-muted-foreground">
                  {v.count}x • {brl(v.total)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-accent"
                  style={{ width: `${Math.max(8, (v.total / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {data.ranking.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              Nenhum serviço finalizado no período.
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 pb-8 pt-5">
        <Link
          to="/despesas"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Receipt className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Despesas</p>
            <p className="text-xs text-muted-foreground">Registrar e acompanhar gastos</p>
          </div>
          <span className="text-sm font-bold">{brl(data.exp)}</span>
        </Link>
      </section>
      <PaymentDrawer order={paying} onClose={() => setPaying(null)} />
    </PhoneShell>
  );
}
