import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import { EmptyState, StatusBadge, TopBar } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl, formatLongDate, parseISO, todayISO } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de atendimentos | ServiceFlow" },
      {
        name: "description",
        content:
          "Visualize os atendimentos por dia e horário, finalize, edite ou cancele atendimentos.",
      },
      { property: "og:title", content: "Agenda de atendimentos | ServiceFlow" },
      {
        property: "og:description",
        content: "Todos os agendamentos organizados por dia e horário.",
      },
    ],
  }),
  component: Agenda,
});

const filters: Array<{ key: OrderStatus | "TODOS"; label: string }> = [
  { key: "TODOS", label: "Todos" },
  { key: "AGENDADO", label: "Agendados" },
  { key: "FINALIZADO", label: "Finalizados" },
  { key: "CANCELADO", label: "Cancelados" },
];

function dayList() {
  const base = new Date();
  base.setDate(base.getDate() - 2);
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function Agenda() {
  const { orders, clientById, vehicleById, serviceById } = useStore();
  const [day, setDay] = useState(todayISO());
  const [status, setStatus] = useState<OrderStatus | "TODOS">("TODOS");
  const days = useMemo(dayList, []);
  const daysRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const updateEdge = () => {
    const el = daysRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 0,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  };
  useEffect(updateEdge, []);
  // ~3 dias por clique (botão w-14 + gap-2 = 64px)
  const scrollDays = (dir: 1 | -1) =>
    daysRef.current?.scrollBy({ left: dir * 192, behavior: "smooth" });
  const arrowClass =
    "hidden w-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-opacity disabled:opacity-30 md:flex";

  const list = orders
    .filter((o) => o.date === day && (status === "TODOS" || o.status === status))
    .sort((a, b) => a.time.localeCompare(b.time));

  const total = list.filter((o) => o.status !== "CANCELADO").reduce((s, o) => s + o.price, 0);

  return (
    <PhoneShell>
      <TopBar title="Agenda" subtitle="Atendimentos por dia e horário" />

      <div className="flex gap-2 px-5 pt-4">
        <button
          type="button"
          aria-label="Dias anteriores"
          disabled={edge.start}
          onClick={() => scrollDays(-1)}
          className={arrowClass}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={daysRef}
          onScroll={updateEdge}
          className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto"
        >
          {days.map((d) => {
            const date = parseISO(d);
            const active = d === day;
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-colors ${
                  active
                    ? "border-transparent bg-brand text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                </span>
                <span className="text-base font-bold">
                  {String(date.getDate()).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Próximos dias"
          disabled={edge.end}
          onClick={() => scrollDays(1)}
          className={arrowClass}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              status === f.key
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 pt-5">
        <p className="text-xs capitalize text-muted-foreground">{formatLongDate(day)}</p>
        <p className="text-xs font-bold">{brl(total)} previsto</p>
      </div>

      <section className="space-y-2.5 px-5 pb-8 pt-3">
        {list.map((o) => {
          const vehicle = vehicleById(o.vehicleId);
          return (
            <Link
              key={o.id}
              to="/os/$osId"
              params={{ osId: o.id }}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold">{o.time}</span>
                <span className="mt-1 h-full w-px bg-border" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{clientById(o.clientId)?.name}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {vehicle?.brand} {vehicle?.model} • {vehicle?.plate}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {serviceById(o.serviceId)?.name}
                  </span>
                  <span className="text-sm font-bold">{brl(o.price)}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {list.length === 0 ? (
          <EmptyState
            title="Nenhum atendimento neste dia"
            description="Toque no botão + para criar um novo atendimento."
          />
        ) : null}

        <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Cancelamentos não entram no faturamento previsto.
        </div>
      </section>
    </PhoneShell>
  );
}
