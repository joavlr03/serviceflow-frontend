import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle, Minus, Plus } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import { Field, PrimaryButton, TopBar, inputClass } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl, todayISO } from "@/lib/format";
import { parseMoney } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/os/nova")({
  head: () => ({
    meta: [
      { title: "Novo atendimento | ServiceFlow" },
      {
        name: "description",
        content:
          "Cadastre cliente, veículo, serviço, data, horário e valor em um único atendimento.",
      },
      { property: "og:title", content: "Novo atendimento | ServiceFlow" },
      {
        property: "og:description",
        content: "Um cadastro alimenta agenda, financeiro e histórico.",
      },
    ],
  }),
  component: NovaOS,
});

const steps = ["Cliente", "Serviço", "Resumo"];

function NovaOS() {
  const navigate = useNavigate();
  const {
    clients,
    services: allServices,
    vehiclesOfClient,
    addOrder,
    addClient,
    addVehicle,
    company,
    products,
  } = useStore();
  const services = useMemo(() => allServices.filter((s) => s.active), [allServices]);
  // Modo vendas: a venda é uma lista de produtos com quantidade, e o valor é a soma.
  const vendas = company.usageMode === "VENDAS";
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const chosen = activeProducts.filter((p) => (qty[p.id] ?? 0) > 0);
  const itemsTotal = chosen.reduce((s, p) => s + p.price * (qty[p.id] ?? 0), 0);
  const itemsText = chosen.map((p) => `${p.name} (${qty[p.id]})`).join(", ");

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [newClient, setNewClient] = useState({ name: "", phone: "" });
  const [vehicleId, setVehicleId] = useState<string>("");
  const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", plate: "", color: "" });
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("09:00");
  const [price, setPrice] = useState<string>(String(services[0]?.price ?? 0));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const cars = useMemo(
    () => (clientId ? vehiclesOfClient(clientId) : []),
    [clientId, vehiclesOfClient],
  );
  const isNewClient = clientId === "__new";

  useEffect(() => {
    if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [clientId, clients]);

  useEffect(() => {
    if (!serviceId && services[0]) {
      setServiceId(services[0].id);
      setPrice(String(services[0].price));
    }
  }, [serviceId, services]);

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      let finalClientId = clientId;
      if (isNewClient) {
        if (!newClient.name.trim() || !newClient.phone.trim()) {
          toast.error("Informe o nome e o telefone do novo cliente");
          return;
        }
        finalClientId = (
          await addClient({
            name: newClient.name.trim(),
            phone: newClient.phone.trim(),
            whatsapp: newClient.phone.trim(),
          })
        ).id;
        setClientId(finalClientId);
      }
      if (!finalClientId) {
        toast.error("Selecione um cliente");
        return;
      }
      let finalVehicleId = vehicleId;
      if (!finalVehicleId || finalVehicleId === "__new") {
        if (!newVehicle.brand.trim() || !newVehicle.model.trim()) {
          toast.error("Informe a marca e o modelo do veículo");
          return;
        }
        finalVehicleId = (await addVehicle({ ...newVehicle, clientId: finalClientId })).id;
        setVehicleId(finalVehicleId);
      }
      const orderPrice = vendas ? itemsTotal : parseMoney(price);
      if (vendas ? chosen.length === 0 : !serviceId) {
        toast.error(vendas ? "Escolha ao menos um produto" : "Escolha o serviço");
        return;
      }
      if (!date || !time || orderPrice <= 0) {
        toast.error("Informe data, horário e um valor maior que zero");
        return;
      }

      idempotencyKeyRef.current ??= crypto.randomUUID();
      const created = await addOrder(
        {
          clientId: finalClientId,
          vehicleId: finalVehicleId,
          serviceId: vendas ? "" : serviceId,
          items: vendas
            ? chosen.map((p) => ({
                productId: p.id,
                name: p.name,
                quantity: qty[p.id] ?? 0,
                unitPrice: p.price,
              }))
            : [],
          date,
          time,
          price: orderPrice,
          notes: notes.trim(),
          status: "AGENDADO",
        },
        idempotencyKeyRef.current,
      );
      await navigate({
        to: "/os/$osId",
        params: { osId: created.id },
        search: { criada: true },
        replace: true,
      });
      toast.success(`${created.code} registrado com sucesso`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o atendimento");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar title="Novo atendimento" subtitle={steps[step] ?? ""} backTo="/dashboard" />

      <div className="flex gap-2 px-5 pt-4">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-secondary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="space-y-4 px-5 pt-5">
        {step === 0 ? (
          <>
            <Field label="Cliente">
              <select
                className={inputClass}
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setVehicleId("");
                }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new">+ Novo cliente</option>
              </select>
            </Field>

            {isNewClient ? (
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <Field label="Nome do cliente">
                  <input
                    className={inputClass}
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    className={inputClass}
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
              </div>
            ) : null}

            <Field label="Veículo">
              <select
                className={inputClass}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Selecione</option>
                {cars.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} — {v.plate}
                  </option>
                ))}
                <option value="__new">+ Novo veículo</option>
              </select>
            </Field>

            {vehicleId === "__new" ||
            (isNewClient && !vehicleId) ||
            (!vehicleId && cars.length === 0) ? (
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4">
                <Field label="Marca">
                  <input
                    className={inputClass}
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  />
                </Field>
                <Field label="Modelo">
                  <input
                    className={inputClass}
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  />
                </Field>
                <Field label="Placa">
                  <input
                    className={inputClass}
                    value={newVehicle.plate}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })
                    }
                  />
                </Field>
                <Field label="Cor">
                  <input
                    className={inputClass}
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}
          </>
        ) : null}

        {step === 1 && vendas ? (
          <Field label="Produtos">
            <div className="space-y-2">
              {activeProducts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nenhum produto ativo.{" "}
                  <Link to="/estoque" className="font-semibold text-secondary underline">
                    Cadastre em Produtos e estoque
                  </Link>
                </p>
              ) : null}
              {activeProducts.map((p) => {
                const n = qty[p.id] ?? 0;
                // Funcional: toques rápidos não perdem contagem; nunca passa do estoque.
                const add = (d: number) =>
                  setQty((q) => ({
                    ...q,
                    [p.id]: Math.max(0, Math.min(p.stock, (q[p.id] ?? 0) + d)),
                  }));
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                      n > 0 ? "border-secondary bg-secondary/8" : "border-border bg-card"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {brl(p.price)} • {p.stock} em estoque
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Tirar um ${p.name}`}
                        disabled={n === 0}
                        onClick={() => add(-1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold" aria-live="polite">
                        {n}
                      </span>
                      <button
                        type="button"
                        aria-label={`Adicionar um ${p.name}`}
                        disabled={n >= p.stock}
                        onClick={() => add(1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-1 pt-1 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{brl(itemsTotal)}</span>
              </div>
            </div>
          </Field>
        ) : null}

        {step === 1 ? (
          <>
            {vendas ? null : (
              <Field label="Serviço">
                <div className="space-y-2">
                  {services.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Nenhum serviço ativo.{" "}
                      <Link to="/servicos" className="font-semibold text-secondary underline">
                        Cadastre em Serviços e preços
                      </Link>
                    </p>
                  ) : null}
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServiceId(s.id);
                        setPrice(String(s.price));
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                        serviceId === s.id
                          ? "border-secondary bg-secondary/8"
                          : "border-border bg-card"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{s.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          Duração aprox. {s.durationMin} min
                        </span>
                      </span>
                      <span className="text-sm font-bold">{brl(s.price)}</span>
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <input
                  type="date"
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="Horário">
                <input
                  type="time"
                  className={inputClass}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>
            </div>

            {vendas ? null : (
              <Field label="Valor (R$)" hint="Você pode ajustar o valor sugerido do serviço.">
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
            )}

            <Field label="Observações">
              <textarea
                rows={3}
                className={inputClass}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes do atendimento"
              />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              {[
                {
                  k: "Cliente",
                  v: isNewClient ? newClient.name : clients.find((c) => c.id === clientId)?.name,
                },
                {
                  k: "Veículo",
                  v:
                    vehicleId && vehicleId !== "__new"
                      ? (() => {
                          const v = cars.find((x) => x.id === vehicleId);
                          return v ? `${v.brand} ${v.model} — ${v.plate}` : "—";
                        })()
                      : `${newVehicle.brand} ${newVehicle.model}`,
                },
                vendas
                  ? { k: "Produtos", v: itemsText }
                  : { k: "Serviço", v: services.find((s) => s.id === serviceId)?.name },
                { k: "Data", v: date.split("-").reverse().join("/") },
                { k: "Horário", v: time },
                { k: "Valor", v: brl(vendas ? itemsTotal : parseMoney(price)) },
                { k: "Status", v: "Agendado" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                >
                  <span className="text-xs text-muted-foreground">{row.k}</span>
                  <span className="text-sm font-semibold">{row.v || "—"}</span>
                </div>
              ))}
            </div>
            <p className="rounded-2xl border border-secondary/20 bg-secondary/8 p-3.5 text-xs text-muted-foreground">
              Ao salvar, o atendimento entra na agenda, no faturamento previsto e no histórico do
              cliente — e a mensagem de WhatsApp é gerada automaticamente.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3 px-5 pb-10 pt-6">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-1/3 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold"
          >
            Voltar
          </button>
        ) : null}
        {step < 2 ? (
          <PrimaryButton onClick={() => setStep((s) => s + 1)}>Continuar</PrimaryButton>
        ) : (
          <PrimaryButton onClick={submit} disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Salvar atendimento
              </>
            )}
          </PrimaryButton>
        )}
      </div>
    </PhoneShell>
  );
}
