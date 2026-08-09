import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { PhoneShell } from "@/components/app/PhoneShell";
import { Field, PrimaryButton, TopBar, inputClass } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl, todayISO } from "@/lib/format";

export const Route = createFileRoute("/os/nova")({
  head: () => ({
    meta: [
      { title: "Nova ordem de serviço | ServiceFlow" },
      {
        name: "description",
        content:
          "Cadastre cliente, veículo, serviço, data, horário e valor em uma única ordem de serviço.",
      },
      { property: "og:title", content: "Nova ordem de serviço | ServiceFlow" },
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
  const { clients, services, vehiclesOfClient, addOrder, addClient, addVehicle } = useStore();

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

  const cars = useMemo(
    () => (clientId ? vehiclesOfClient(clientId) : []),
    [clientId, vehiclesOfClient],
  );
  const isNewClient = clientId === "__new";

  const submit = async () => {
    let finalClientId = clientId;
    if (isNewClient) {
      if (!newClient.name.trim()) return;
      finalClientId = (
        await addClient({
          name: newClient.name,
          phone: newClient.phone,
          whatsapp: newClient.phone,
        })
      ).id;
    }
    let finalVehicleId = vehicleId;
    if (!finalVehicleId || finalVehicleId === "__new") {
      if (!newVehicle.brand.trim() && !newVehicle.model.trim()) return;
      finalVehicleId = (await addVehicle({ ...newVehicle, clientId: finalClientId })).id;
    }
    const created = await addOrder({
      clientId: finalClientId,
      vehicleId: finalVehicleId,
      serviceId,
      date,
      time,
      price: Number(price) || 0,
      notes,
      status: "AGENDADO",
    });
    navigate({ to: "/os/$osId", params: { osId: created.id } });
  };

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar title="Nova ordem de serviço" subtitle={steps[step] ?? ""} backTo="/dashboard" />

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

        {step === 1 ? (
          <>
            <Field label="Serviço">
              <div className="space-y-2">
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

            <Field label="Valor (R$)" hint="Você pode ajustar o valor sugerido do serviço.">
              <input
                type="number"
                inputMode="decimal"
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>

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
                { k: "Serviço", v: services.find((s) => s.id === serviceId)?.name },
                { k: "Data", v: date.split("-").reverse().join("/") },
                { k: "Horário", v: time },
                { k: "Valor", v: brl(Number(price) || 0) },
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
              Ao salvar, a OS entra na agenda, no faturamento previsto e no histórico do cliente — e
              a mensagem de WhatsApp é gerada automaticamente.
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
          <PrimaryButton onClick={submit}>
            <Check className="h-4 w-4" /> Salvar OS
          </PrimaryButton>
        )}
      </div>
    </PhoneShell>
  );
}
