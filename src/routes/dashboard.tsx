import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Plus,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import { StatCard, StatusBadge } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { useTermos } from "@/lib/termos";
import { brl, formatLongDate, todayISO } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel do dia | ServiceFlow" },
      {
        name: "description",
        content:
          "Resumo diário: agendamentos, faturamento previsto, próximos atendimentos e atalhos rápidos.",
      },
      { property: "og:title", content: "Painel do dia | ServiceFlow" },
      { property: "og:description", content: "Veja como está o dia da sua operação em segundos." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { company, orders, clientById, vehicleById, orderTitle } = useStore();
  const t = useTermos();
  const today = todayISO();
  const todays = orders
    .filter((o) => o.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const scheduled = todays.filter((o) => o.status === "AGENDADO");
  const done = todays.filter((o) => o.status === "FINALIZADO");
  const expected = todays.filter((o) => o.status !== "CANCELADO").reduce((s, o) => s + o.price, 0);
  const next = scheduled[0];

  return (
    <PhoneShell>
      <header className="relative rounded-b-[2rem] bg-brand px-5 pb-8 pt-10 text-primary-foreground">
        <Link
          to="/configuracoes"
          aria-label="Configurações"
          className="absolute right-5 top-9 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors active:bg-primary-foreground/20"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <p className="pr-12 text-xs uppercase tracking-widest opacity-60">{company.segment}</p>
        <h1 className="mt-1 pr-12 text-2xl font-extrabold tracking-tight">{company.name}</h1>
        <p className="mt-1 text-sm capitalize opacity-70">{formatLongDate(today)}</p>

        {next ? (
          <div className="mt-6 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
              Próximo cliente
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{clientById(next.clientId)?.name}</p>
                <p className="truncate text-xs opacity-75">
                  {orderTitle(next)} • {vehicleById(next.vehicleId)?.brand}{" "}
                  {vehicleById(next.vehicleId)?.model}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1.5 text-sm font-bold text-secondary-foreground">
                <Clock className="h-4 w-4" />
                {next.time}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section className="grid grid-cols-2 gap-3 px-5 pt-5">
        <StatCard
          label="Agendamentos hoje"
          value={String(todays.length)}
          hint={`${scheduled.length} pendentes`}
        />
        <StatCard label="Previsto hoje" value={brl(expected)} tone="accent" />
        <StatCard
          label="Concluídos"
          value={String(done.length)}
          hint={brl(done.reduce((s, o) => s + o.price, 0))}
        />
        <StatCard label="Ticket médio" value={brl(todays.length ? expected / todays.length : 0)} />
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold">Atalhos rápidos</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { to: "/os/nova", label: t.novo, icon: Plus },
            // Modo vendas troca a agenda pelo atalho de estoque.
            company.usageMode === "VENDAS"
              ? { to: "/estoque", label: "Estoque", icon: Package }
              : { to: "/agenda", label: "Agenda", icon: CalendarDays },
            { to: "/clientes", label: "Clientes", icon: Users },
            { to: "/despesas", label: "Despesas", icon: Receipt },
          ].map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <s.icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-[11px] font-semibold leading-tight">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">
            Próxim{t.o}s {t.atendimentos}
          </h2>
          <Link to="/agenda" className="text-xs font-semibold text-secondary">
            Ver agenda
          </Link>
        </div>
        <div className="space-y-2.5">
          {todays.map((o) => {
            const client = clientById(o.clientId);
            const vehicle = vehicleById(o.vehicleId);
            return (
              <Link
                key={o.id}
                to="/os/$osId"
                params={{ osId: o.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
              >
                <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-muted py-2">
                  <span className="text-sm font-bold">{o.time}</span>
                  <span className="text-[10px] text-muted-foreground">{t.codigo(o.code)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{client?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {vehicle?.brand} {vehicle?.model} • {orderTitle(o)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="text-xs font-bold">{brl(o.price)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {todays.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              {t.nenhum} agendad{t.o} para hoje.
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 pb-8 pt-6">
        <div className="rounded-2xl border border-secondary/20 bg-secondary/8 p-4">
          <div className="flex items-center gap-2 text-secondary">
            <MessageSquareText className="h-4 w-4" />
            <p className="text-sm font-bold">Mensagens de confirmação</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Gere a mensagem pronta d{t.o} {t.atendimento} e envie você mesmo pelo WhatsApp, mantendo
            o contato pessoal.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <p className="text-xs text-muted-foreground">
            Receita realizada considera apenas {t.atendimentos} finalizad{t.o}s.
          </p>
          <TrendingUp className="ml-auto h-4 w-4 text-muted-foreground" />
        </div>
      </section>
    </PhoneShell>
  );
}
