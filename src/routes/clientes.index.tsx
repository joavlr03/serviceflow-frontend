import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Car, Phone, Plus, Search, X } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import {
  EmptyState,
  Field,
  GhostButton,
  PrimaryButton,
  TopBar,
  inputClass,
} from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { useTermos } from "@/lib/termos";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes e veículos | ServiceFlow" },
      {
        name: "description",
        content: "Cadastre clientes, consulte veículos, histórico de serviços e última visita.",
      },
      { property: "og:title", content: "Clientes e veículos | ServiceFlow" },
      { property: "og:description", content: "Base de clientes do seu negócio sempre organizada." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { clients, vehiclesOfClient, ordersOfClient, addClient } = useStore();
  const t = useTermos();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", notes: "" });

  const list = useMemo(
    () =>
      clients.filter((c) => (c.name + c.phone).toLowerCase().includes(query.trim().toLowerCase())),
    [clients, query],
  );

  return (
    <PhoneShell fab={false}>
      <TopBar
        title="Clientes"
        subtitle={`${clients.length} cadastrados`}
        action={
          <button
            onClick={() => setOpen(true)}
            aria-label="Novo cliente"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <section className="space-y-2.5 px-5 pb-8 pt-4">
        {list.map((c) => {
          const cars = vehiclesOfClient(c.id);
          const history = ordersOfClient(c.id).filter((o) => o.status === "FINALIZADO");
          const last = history[0];
          return (
            <Link
              key={c.id}
              to="/clientes/$clientId"
              params={{ clientId: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-primary-foreground">
                {c.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {c.phone}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Car className="h-3 w-3" /> {cars.length} veículo(s)
                  </span>
                  <span>•</span>
                  <span>
                    {history.length} {t.atendimentos}
                  </span>
                </p>
              </div>
              {last ? (
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDate(last.date)}
                </span>
              ) : null}
            </Link>
          );
        })}

        {list.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou cadastre um novo cliente."
          />
        ) : null}
      </section>

      {open ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Novo cliente</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </Field>
              <Field label="Telefone">
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </Field>
              <Field label="WhatsApp" hint="Usado para gerar as mensagens de confirmação.">
                <input
                  className={inputClass}
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </Field>
              <Field label="Observações">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Preferências, restrições, informações úteis"
                />
              </Field>
              <PrimaryButton
                onClick={async () => {
                  if (!form.name.trim() || !form.phone.trim()) {
                    toast.error("Informe o nome e o telefone do cliente");
                    return;
                  }
                  try {
                    await addClient({
                      name: form.name.trim(),
                      phone: form.phone.trim(),
                      whatsapp: form.whatsapp.trim() || form.phone.trim(),
                      notes: form.notes.trim(),
                    });
                    setForm({ name: "", phone: "", whatsapp: "", notes: "" });
                    setOpen(false);
                    toast.success("Cliente salvo com sucesso");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Não foi possível salvar o cliente",
                    );
                  }
                }}
              >
                Salvar cliente
              </PrimaryButton>
              <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
            </div>
          </div>
        </div>
      ) : null}
    </PhoneShell>
  );
}
