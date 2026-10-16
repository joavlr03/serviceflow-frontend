import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, HandCoins, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PhoneShell } from "@/components/app/PhoneShell";
import { StatCard, TopBar } from "@/components/app/ui-bits";
import { PaymentDrawer } from "@/components/app/PaymentDrawer";
import { useStore } from "@/lib/store";
import { brl, formatDate, parseISO, startOfMonthISO, startOfWeekISO, todayISO } from "@/lib/format";
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

const shiftISO = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// Último dia do período atual e o período anterior inteiro, do mesmo tipo (ontem, semana passada, mês passado).
function periodRange(period: Period, from: string) {
  if (period === "hoje")
    return { end: from, prevFrom: shiftISO(from, -1), prevTo: shiftISO(from, -1) };
  if (period === "semana")
    return { end: shiftISO(from, 6), prevFrom: shiftISO(from, -7), prevTo: shiftISO(from, -1) };
  const d = new Date(`${from}T00:00:00Z`);
  const iso = (m: number, day: number) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, day)).toISOString().slice(0, 10);
  return { end: iso(1, 0), prevFrom: iso(-1, 1), prevTo: shiftISO(from, -1) };
}

const variation = (cur: number, prev: number) =>
  prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100;

const chartConfig = {
  receita: { label: "Receita", color: "var(--chart-1)" },
  despesa: { label: "Despesa", color: "var(--chart-5)" },
  lucro: { label: "Lucro", color: "var(--chart-2)" },
} satisfies ChartConfig;

function Financeiro() {
  const { company, orders, expenses, incomes, clientById, vehicleById, serviceById, orderTitle } =
    useStore();
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
    // Entradas avulsas somam na receita (realizada e prevista); o ticket médio fica só com atendimentos.
    const ordersRealized = finished.reduce((s, o) => s + o.price, 0);
    const periodIncomes = incomes.filter((e) => inRange(e.date));
    const inc = periodIncomes.reduce((s, e) => s + e.amount, 0);
    const realized = ordersRealized + inc;
    const forecast = realized + scheduled.reduce((s, o) => s + o.price, 0);
    const periodExpenses = expenses.filter((e) => inRange(e.date));
    const exp = periodExpenses.reduce((s, e) => s + e.amount, 0);
    const sumOn = (list: typeof expenses, d: string) =>
      list.filter((e) => e.date === d).reduce((s, e) => s + e.amount, 0);

    const byService = new Map<string, { count: number; total: number }>();
    finished.forEach((o) => {
      // Venda conta cada produto pela quantidade; atendimento conta o serviço uma vez.
      const linhas = o.items?.length
        ? o.items.map((i) => ({ name: i.name, count: i.quantity, total: i.quantity * i.unitPrice }))
        : [{ name: serviceById(o.serviceId)?.name ?? "Serviço", count: 1, total: o.price }];
      linhas.forEach(({ name, count, total }) => {
        const cur = byService.get(name) ?? { count: 0, total: 0 };
        byService.set(name, { count: cur.count + count, total: cur.total + total });
      });
    });

    const { end, prevFrom, prevTo } = periodRange(period, from);
    const sumOrders = (pick: (o: ServiceOrder) => boolean) =>
      finished.filter(pick).reduce((s, o) => s + o.price, 0);

    // Hoje: receita de atendimentos por horário (entrada e despesa não têm hora). Semana/Mês: um ponto por dia.
    let series: Array<{ label: string; receita: number; despesa?: number; lucro?: number }>;
    if (period === "hoje") {
      const hours = [...new Set(finished.map((o) => o.time.slice(0, 2)))].sort();
      series = hours.map((h) => ({
        label: `${h}h`,
        receita: sumOrders((o) => o.time.startsWith(h)),
      }));
    } else {
      series = [];
      for (let d = from; d <= end; d = shiftISO(d, 1)) {
        const receita = sumOrders((o) => o.date === d) + sumOn(periodIncomes, d);
        const despesa = sumOn(periodExpenses, d);
        const label =
          period === "semana"
            ? parseISO(d).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
            : String(Number(d.slice(8)));
        series.push({ label, receita, despesa, lucro: receita - despesa });
      }
    }

    const byCategory = new Map<string, number>();
    periodExpenses.forEach((e) =>
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount),
    );

    const inPrev = (d: string) => d >= prevFrom && d <= prevTo;
    const prevRealized =
      orders
        .filter((o) => o.status === "FINALIZADO" && inPrev(o.date))
        .reduce((s, o) => s + o.price, 0) +
      incomes.filter((e) => inPrev(e.date)).reduce((s, e) => s + e.amount, 0);
    const prevExp = expenses
      .filter((e) => e.date >= prevFrom && e.date <= prevTo)
      .reduce((s, e) => s + e.amount, 0);

    return {
      os,
      periodExpenses,
      periodIncomes,
      inc,
      series,
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      previous: { realized: prevRealized, exp: prevExp, profit: prevRealized - prevExp },
      realized,
      forecast,
      exp,
      profit: realized - exp,
      finished: finished.length,
      canceled: canceled.length,
      ticket: finished.length ? ordersRealized / finished.length : 0,
      ranking: [...byService.entries()].sort((a, b) => b[1].total - a[1].total),
    };
  }, [orders, expenses, incomes, from, to, period, serviceById]);

  const max = data.ranking[0]?.[1].total ?? 1;
  const maxCategory = data.categories[0]?.[1] ?? 1;
  const empty = data.realized === 0 && data.exp === 0;
  const previousLabel =
    period === "hoje" ? "ontem" : period === "semana" ? "semana passada" : "mês passado";

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
                incomes: data.periodIncomes,
                summary: data,
                clientById,
                vehicleById,
                orderTitle,
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
        <h2 className="mb-3 text-sm font-bold">
          {period === "hoje" ? "Receita por horário" : "Receita × despesa"}
        </h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          {empty ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              Sem movimentação neste período.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
              <ComposedChart data={data.series} margin={{ left: 0, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full justify-between gap-3">
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                          </span>
                          <span className="font-medium tabular-nums">{brl(Number(value))}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={3} />
                {/* Recharts não enxerga filhos dentro de fragmento: uma condição por série. */}
                {period !== "hoje" && (
                  <Bar dataKey="despesa" fill="var(--color-despesa)" radius={3} />
                )}
                {period !== "hoje" && (
                  <Line
                    dataKey="lucro"
                    stroke="var(--color-lucro)"
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                )}
                {period !== "hoje" && <ChartLegend content={<ChartLegendContent />} />}
              </ComposedChart>
            </ChartContainer>
          )}
        </div>
        {period === "hoje" && !empty ? (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Entradas avulsas do dia: {brl(data.inc)} • Despesas do dia: {brl(data.exp)} (não têm
            horário).
          </p>
        ) : null}
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold">Comparado com {previousLabel}</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["Receita", data.realized, data.previous.realized, true],
              ["Despesa", data.exp, data.previous.exp, false],
              ["Lucro", data.profit, data.previous.profit, true],
            ] as Array<[string, number, number, boolean]>
          ).map(([label, cur, prev, upIsGood]) => {
            const v = variation(cur, prev);
            const good = v !== null && (upIsGood ? v > 0 : v < 0);
            return (
              <div key={label} className="rounded-2xl border border-border bg-card p-3 shadow-card">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-bold">{brl(cur)}</p>
                <p
                  className={`mt-1 text-[11px] font-semibold ${
                    v === null || v === 0
                      ? "text-muted-foreground"
                      : good
                        ? "text-emerald-600"
                        : "text-destructive"
                  }`}
                >
                  {v === null ? "—" : `${v > 0 ? "+" : ""}${Math.round(v)}%`}
                </p>
                <p className="text-[10px] text-muted-foreground">antes {brl(prev)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold">Despesas por categoria</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          {data.categories.map(([name, total]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{name}</span>
                <span className="text-muted-foreground">{brl(total)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-5"
                  style={{ width: `${Math.max(8, (total / maxCategory) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {data.categories.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">Nenhuma despesa no período.</p>
          ) : null}
        </div>
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
        <h2 className="mb-3 text-sm font-bold">
          {company.usageMode === "VENDAS" ? "Produtos mais vendidos" : "Serviços mais vendidos"}
        </h2>
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

      <section className="space-y-2.5 px-5 pb-8 pt-5">
        <Link
          to="/entradas"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
            <HandCoins className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Entradas avulsas</p>
            <p className="text-xs text-muted-foreground">Vendas, comissões e outras receitas</p>
          </div>
          <span className="text-sm font-bold">{brl(data.inc)}</span>
        </Link>
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
