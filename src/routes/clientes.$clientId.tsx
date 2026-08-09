import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Car, MessageCircle, Phone, Plus, X } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import {
  EmptyState,
  Field,
  GhostButton,
  PrimaryButton,
  StatCard,
  StatusBadge,
  TopBar,
  inputClass,
} from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl, formatDate } from "@/lib/format";

export const Route = createFileRoute("/clientes/$clientId")({
  head: () => ({
    meta: [
      { title: "Perfil do cliente | ServiceFlow" },
      {
        name: "description",
        content: "Histórico de serviços, veículos, total gasto e última visita do cliente.",
      },
      { property: "og:title", content: "Perfil do cliente | ServiceFlow" },
      { property: "og:description", content: "Tudo sobre o cliente em uma única tela." },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { clientId } = useParams({ from: "/clientes/$clientId" });
  const { clientById, vehiclesOfClient, ordersOfClient, serviceById, vehicleById, addVehicle } =
    useStore();
  const client = clientById(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", plate: "", color: "" });

  if (!client) {
    return (
      <PhoneShell fab={false}>
        <TopBar title="Cliente" backTo="/clientes" />
        <div className="p-5">
          <EmptyState
            title="Cliente não encontrado"
            description="Volte para a lista de clientes."
          />
        </div>
      </PhoneShell>
    );
  }

  const cars = vehiclesOfClient(client.id);
  const history = ordersOfClient(client.id);
  const finished = history.filter((o) => o.status === "FINALIZADO");
  const totalSpent = finished.reduce((s, o) => s + o.price, 0);

  return (
    <PhoneShell fab={false}>
      <TopBar
        title={client.name}
        subtitle={`Cliente desde ${formatDate(client.createdAt)}`}
        backTo="/clientes"
      />

      <section className="px-5 pt-4">
        <div className="rounded-2xl bg-brand p-4 text-primary-foreground shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent text-base font-bold text-secondary-foreground">
              {client.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{client.name}</p>
              <p className="flex items-center gap-1 text-xs opacity-75">
                <Phone className="h-3 w-3" /> {client.phone}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-foreground/12 py-2.5 text-xs font-semibold"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Link
              to="/os/nova"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent py-2.5 text-xs font-semibold text-secondary-foreground"
            >
              <Plus className="h-4 w-4" /> Nova OS
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 px-5 pt-4">
        <StatCard label="Atendimentos" value={String(finished.length)} />
        <StatCard label="Total gasto" value={brl(totalSpent)} tone="accent" />
        <StatCard label="Última visita" value={finished[0] ? formatDate(finished[0].date) : "—"} />
      </section>

      {client.notes ? (
        <p className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
          {client.notes}
        </p>
      ) : null}

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Veículos</h2>
          <button onClick={() => setOpen(true)} className="text-xs font-semibold text-secondary">
            Adicionar
          </button>
        </div>
        <div className="space-y-2.5">
          {cars.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Car className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {v.brand} {v.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  {v.plate} • {v.color}
                </p>
              </div>
            </div>
          ))}
          {cars.length === 0 ? (
            <EmptyState title="Sem veículos" description="Cadastre o veículo do cliente." />
          ) : null}
        </div>
      </section>

      <section className="px-5 pb-8 pt-6">
        <h2 className="mb-3 text-sm font-bold">Histórico de serviços</h2>
        <div className="space-y-2.5">
          {history.map((o) => {
            const v = vehicleById(o.vehicleId);
            return (
              <Link
                key={o.id}
                to="/os/$osId"
                params={{ osId: o.id }}
                className="block rounded-2xl border border-border bg-card p-3.5 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{serviceById(o.serviceId)?.name}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(o.date)} às {o.time} • {v?.brand} {v?.model}
                </p>
                <p className="mt-1 text-sm font-bold">{brl(o.price)}</p>
              </Link>
            );
          })}
          {history.length === 0 ? (
            <EmptyState
              title="Sem histórico"
              description="Este cliente ainda não possui atendimentos."
            />
          ) : null}
        </div>
      </section>

      {open ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="w-full rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Novo veículo</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca">
                  <input
                    className={inputClass}
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </Field>
                <Field label="Modelo">
                  <input
                    className={inputClass}
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </Field>
                <Field label="Placa">
                  <input
                    className={inputClass}
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label="Cor">
                  <input
                    className={inputClass}
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </Field>
              </div>
              <PrimaryButton
                onClick={async () => {
                  if (!form.brand.trim() || !form.model.trim()) return;
                  await addVehicle({ ...form, clientId: client.id });
                  setForm({ brand: "", model: "", plate: "", color: "" });
                  setOpen(false);
                }}
              >
                Salvar veículo
              </PrimaryButton>
              <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
            </div>
          </div>
        </div>
      ) : null}
    </PhoneShell>
  );
}
