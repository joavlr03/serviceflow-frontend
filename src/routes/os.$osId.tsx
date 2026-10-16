import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Check, CheckCircle2, Copy, MessageCircle, Pencil, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/app/PhoneShell";
import {
  EmptyState,
  GhostButton,
  PrimaryButton,
  StatusBadge,
  TopBar,
  inputClass,
  paymentText,
} from "@/components/app/ui-bits";
import { PaymentDrawer } from "@/components/app/PaymentDrawer";
import { useStore } from "@/lib/store";
import { useTermos } from "@/lib/termos";
import { brl, formatDate } from "@/lib/format";

export const Route = createFileRoute("/os/$osId")({
  // Opcional: os links da agenda e do financeiro abrem o detalhe sem passar "criada".
  validateSearch: (search: Record<string, unknown>): { criada?: boolean } => ({
    criada: search["criada"] === true || search["criada"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Detalhes do atendimento e mensagem | ServiceFlow" },
      {
        name: "description",
        content:
          "Veja os detalhes do atendimento, finalize, cancele e gere a mensagem de WhatsApp.",
      },
      { property: "og:title", content: "Detalhes do atendimento e mensagem | ServiceFlow" },
      { property: "og:description", content: "Mensagem profissional pronta para envio manual." },
    ],
  }),
  component: OsDetail,
});

function OsDetail() {
  const { osId } = useParams({ from: "/os/$osId" });
  const { criada } = Route.useSearch();
  const { orders, clientById, vehicleById, orderTitle, setOrderStatus } = useStore();
  const t = useTermos();
  const order = orders.find((o) => o.id === osId);

  const client = order ? clientById(order.clientId) : undefined;
  const vehicle = order ? vehicleById(order.vehicleId) : undefined;
  const title = order ? orderTitle(order) : "";

  const defaultMessage = useMemo(() => {
    if (!order) return "";
    const nome = client?.name?.split(" ")[0] ?? "cliente";
    // Venda: modelo de compra, sem data, horário nem veículo (spec 006).
    if (order.items?.length)
      return [
        `Olá, ${nome}!`,
        "",
        "Sua compra foi confirmada.",
        "",
        ...order.items.map((i) => `${i.name} (${i.quantity})`),
        brl(order.price),
        "",
        "Obrigado pela preferência!",
      ].join("\n");
    return [
      `Olá, ${nome}!`,
      "",
      "Seu atendimento foi confirmado.",
      "",
      `Data: ${formatDate(order.date)}`,
      `Horário: ${order.time}`,
      `Veículo: ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim(),
      `Serviço: ${title}`,
      `Valor: ${brl(order.price)}`,
      "",
      "Obrigado pela preferência!",
    ].join("\n");
  }, [order, client, vehicle, title]);

  // Segue o texto padrão até a pessoa editar; o padrão só fica pronto quando os dados carregam.
  const [edited, setMessage] = useState<string | null>(null);
  const message = edited ?? defaultMessage;
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!order) {
    return (
      <PhoneShell fab={false} bottomNav={false}>
        <TopBar title={t.Atendimento} backTo="/agenda" />
        <div className="p-5">
          <EmptyState
            title={`${t.Atendimento} não encontrad${t.o}`}
            description="Volte para a agenda."
          />
        </div>
      </PhoneShell>
    );
  }

  const rows = [
    { k: "Cliente", v: client?.name },
    { k: "Telefone", v: client?.phone },
    { k: "Veículo", v: `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}` },
    { k: "Placa", v: vehicle?.plate },
    { k: order.items?.length ? "Produtos" : "Serviço", v: title },
    { k: "Data", v: formatDate(order.date) },
    { k: "Horário", v: order.time },
    { k: "Valor", v: brl(order.price) },
    ...(order.status === "FINALIZADO" ? [{ k: "Pagamento", v: paymentText(order) }] : []),
  ];

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar title={t.codigo(order.code)} subtitle={t.Atendimento} backTo="/agenda" />

      {criada ? (
        <div
          role="status"
          className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-success"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">
              {t.Atendimento} registrad{t.o} com sucesso
            </p>
            <p className="mt-0.5 text-xs text-foreground">
              {t.codigo(order.code)} já foi adicionad{t.o} à agenda e ao faturamento previsto.
            </p>
          </div>
        </div>
      ) : null}

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{brl(order.price)}</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-3">
            {rows.map((row) => (
              <div
                key={row.k}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <span className="text-xs text-muted-foreground">{row.k}</span>
                <span className="text-sm font-semibold">{row.v || "—"}</span>
              </div>
            ))}
          </div>
          {order.notes ? (
            <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              {order.notes}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="rounded-2xl border border-secondary/20 bg-secondary/8 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-secondary">Mensagem para o cliente</p>
            <button
              onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-secondary"
            >
              <Pencil className="h-3.5 w-3.5" /> {editing ? "Pré-visualizar" : "Editar"}
            </button>
          </div>

          {editing ? (
            <textarea
              rows={11}
              className={inputClass}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          ) : (
            <pre className="whitespace-pre-wrap rounded-xl bg-card p-4 font-sans text-sm leading-relaxed">
              {message}
            </pre>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <GhostButton
              onClick={() => {
                navigator.clipboard?.writeText(message);
                toast.success("Mensagem copiada");
              }}
            >
              <Copy className="h-4 w-4" /> Copiar
            </GhostButton>
            <a
              href={`https://wa.me/55${(client?.whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-float"
            >
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
            </a>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            O envio continua manual — você mantém o contato pessoal com o cliente.
          </p>
        </div>
      </section>

      <section className="space-y-2.5 px-5 pb-10 pt-5">
        {order.status === "AGENDADO" ? (
          <>
            <PrimaryButton onClick={() => setPaying(true)}>
              <Check className="h-4 w-4" /> Marcar como finalizada
            </PrimaryButton>
            <GhostButton
              onClick={async () => {
                await setOrderStatus(order.id, "CANCELADO");
                toast(`${t.Atendimento} cancelad${t.o} — removid${t.o} do faturamento previsto`);
              }}
            >
              <Ban className="h-4 w-4" /> Cancelar {t.atendimento}
            </GhostButton>
          </>
        ) : (
          <>
            {order.status === "FINALIZADO" && !order.paid ? (
              <PrimaryButton onClick={() => setPaying(true)}>
                <Wallet className="h-4 w-4" /> Marcar como pago
              </PrimaryButton>
            ) : null}
            <GhostButton onClick={() => void setOrderStatus(order.id, "AGENDADO")}>
              Reabrir como agendado
            </GhostButton>
          </>
        )}
        <Link
          to="/clientes/$clientId"
          params={{ clientId: order.clientId }}
          className="block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold"
        >
          Ver perfil do cliente
        </Link>
      </section>
      <PaymentDrawer order={paying ? order : null} onClose={() => setPaying(false)} />
    </PhoneShell>
  );
}
