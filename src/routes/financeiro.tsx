import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Receipt } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import { StatCard, TopBar } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl, startOfMonthISO, startOfWeekISO, todayISO } from "@/lib/format";

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
  const { orders, expenses, serviceById } = useStore();
  const [period, setPeriod] = useState<Period>("mes");

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
    const exp = expenses.filter((e) => inRange(e.date)).reduce((s, e) => s + e.amount, 0);

    const byService = new Map<string, { count: number; total: number }>();
    finished.forEach((o) => {
      const name = serviceById(o.serviceId)?.name ?? "Serviço";
      const cur = byService.get(name) ?? { count: 0, total: 0 };
      byService.set(name, { count: cur.count + 1, total: cur.total + o.price });
    });

    return {
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
    </PhoneShell>
  );
}
