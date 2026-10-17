import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/app/PhoneShell";
import { Field, PrimaryButton, TopBar, inputClass } from "@/components/app/ui-bits";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { brl, parseMoney } from "@/lib/format";
import { DEFAULT_THEME_COLOR, previewThemeColor, themePalette } from "@/lib/theme";
import type { OnboardingInput } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Primeiro acesso | ServiceFlow" }] }),
  component: Onboarding,
});

type Row = { name: string; price: string; duration: string; stock: string };
const row = (name = "", price = "", duration = "60", stock = "0"): Row => ({
  name,
  price,
  duration,
  stock,
});

// Serviços sugeridos por segmento; tudo é editável no passo 2.
const segmentos: Array<{ nome: string; veiculo: boolean; servicos: Row[] }> = [
  {
    nome: "Lava-rápido / estética automotiva",
    veiculo: true,
    servicos: [
      row("Lavagem simples", "45,00", "40"),
      row("Lavagem completa", "80,00", "70"),
      row("Polimento", "220,00", "180"),
      row("Higienização interna", "160,00", "120"),
    ],
  },
  {
    nome: "Oficina",
    veiculo: true,
    servicos: [
      row("Troca de óleo", "120,00", "40"),
      row("Alinhamento e balanceamento", "150,00", "60"),
      row("Revisão completa", "350,00", "180"),
      row("Diagnóstico", "100,00", "60"),
    ],
  },
  {
    nome: "Salão / barbearia",
    veiculo: false,
    servicos: [
      row("Corte", "50,00", "40"),
      row("Barba", "35,00", "30"),
      row("Escova", "60,00", "45"),
      row("Coloração", "150,00", "120"),
    ],
  },
  {
    nome: "Estética / beleza",
    veiculo: false,
    servicos: [
      row("Limpeza de pele", "120,00", "60"),
      row("Design de sobrancelha", "40,00", "30"),
      row("Depilação", "60,00", "40"),
      row("Massagem", "100,00", "60"),
    ],
  },
  { nome: "Outro", veiculo: false, servicos: [row()] },
];

const passos = ["Empresa", "Itens", "Tema", "Resumo"];

function Onboarding() {
  const { company, completeOnboarding } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [segment, setSegment] = useState(segmentos[0]!.nome);
  const [mode, setMode] = useState<OnboardingInput["usageMode"]>("SERVICOS");
  const [usesVehicle, setUsesVehicle] = useState(true);
  const [usesDuration, setUsesDuration] = useState(true);
  const [services, setServices] = useState<Row[]>(segmentos[0]!.servicos);
  const [products, setProducts] = useState<Row[]>([row()]);
  const [color, setColor] = useState<string>(DEFAULT_THEME_COLOR);
  const [saving, setSaving] = useState(false);
  const done = useRef(false);
  const vendas = mode === "VENDAS";

  // Empresa que já concluiu não volta ao assistente; o nome vem do cadastro.
  useEffect(() => {
    if (company.onboardingDone) void navigate({ to: "/dashboard", replace: true });
    if (company.name) setName((n) => n || company.name);
    if (company.themeColor) setColor((c) => (c === DEFAULT_THEME_COLOR ? company.themeColor! : c));
  }, [company, navigate]);
  // Sair sem concluir desfaz a prévia da cor (nada é gravado antes de "Concluir").
  useEffect(() => () => void (done.current || previewThemeColor(company.themeColor)), [company]);

  const pickSegment = (nome: string) => {
    const s = segmentos.find((x) => x.nome === nome)!;
    setSegment(nome);
    setUsesVehicle(s.veiculo);
    setServices(s.servicos);
  };

  const rows = vendas ? products : services;
  const setRows = vendas ? setProducts : setServices;
  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  // Valida o passo atual; devolve a mensagem de erro ou null.
  const invalid = (): string | null => {
    if (step === 0) return name.trim() ? null : "Informe o nome da empresa";
    if (step !== 1) return null;
    const filled = rows.filter((r) => r.name.trim());
    if (filled.length === 0)
      return vendas ? "Cadastre ao menos um produto" : "Cadastre ao menos um serviço";
    for (const r of filled) {
      if (!r.price.trim() || parseMoney(r.price) < 0) return `Preço inválido em "${r.name}"`;
      const d = Number(r.duration);
      if (!vendas && usesDuration && (!Number.isInteger(d) || d < 1 || d > 1440))
        return `Duração de "${r.name}" deve ser entre 1 e 1440 minutos`;
      const st = Number(r.stock);
      if (vendas && (!Number.isInteger(st) || st < 0))
        return `Estoque de "${r.name}" deve ser um número inteiro, zero ou maior`;
    }
    return null;
  };

  const next = () => {
    const error = invalid();
    if (error) toast.error(error);
    else setStep((s) => s + 1);
  };

  const finish = async () => {
    setSaving(true);
    try {
      const filled = rows.filter((r) => r.name.trim());
      await completeOnboarding({
        name: name.trim(),
        segment,
        usageMode: mode,
        usesVehicle: !vendas && usesVehicle,
        usesDuration: !vendas && usesDuration,
        themeColor: color,
        services: vendas
          ? []
          : filled.map((r) => ({
              name: r.name.trim(),
              price: parseMoney(r.price),
              ...(usesDuration ? { durationMin: Number(r.duration) } : {}),
            })),
        products: vendas
          ? filled.map((r) => ({
              name: r.name.trim(),
              price: parseMoney(r.price),
              stock: Number(r.stock),
            }))
          : [],
      });
      done.current = true;
      toast.success("Tudo pronto! Bem-vindo ao ServiceFlow.");
      await navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir");
    } finally {
      setSaving(false);
    }
  };

  const filled = rows.filter((r) => r.name.trim());

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar title="Primeiro acesso" subtitle={`${step + 1} de 4 • ${passos[step]}`} />

      <div className="flex gap-2 px-5 pt-4">
        {passos.map((p, i) => (
          <div
            key={p}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-secondary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="space-y-4 px-5 pt-5">
        {step === 0 ? (
          <>
            <Field label="Nome da empresa">
              <input
                className={inputClass}
                value={name}
                maxLength={150}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Segmento">
              <select
                className={inputClass}
                value={segment}
                onChange={(e) => pickSegment(e.target.value)}
              >
                {segmentos.map((s) => (
                  <option key={s.nome} value={s.nome}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Como você vai usar o app?">
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["SERVICOS", "Atendimentos", "Agenda de serviços para clientes"],
                    ["VENDAS", "Vendas", "Venda de produtos com estoque"],
                  ] as const
                ).map(([key, title, hint]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={mode === key}
                    onClick={() => setMode(key)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      mode === key ? "border-secondary bg-secondary/8" : "border-border bg-card"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-[11px] text-muted-foreground">{hint}</span>
                  </button>
                ))}
              </div>
            </Field>
            {vendas ? null : (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
                <span>
                  <span className="block text-sm font-semibold">Você atende veículos?</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Mostra modelo, placa e cor nos atendimentos.
                  </span>
                </span>
                <Switch
                  aria-label="Atende veículos"
                  checked={usesVehicle}
                  onCheckedChange={setUsesVehicle}
                  className="data-[state=checked]:bg-secondary"
                />
              </div>
            )}
          </>
        ) : null}

        {step === 1 ? (
          <>
            {vendas ? (
              <p className="text-xs text-muted-foreground">
                Cadastre os produtos que você vende e quantos tem em estoque. Dá para mudar depois
                em Produtos e estoque.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Sugestões para {segment.toLowerCase()}. Edite, remova ou adicione; dá para mudar
                  depois em Configurações.
                </p>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
                  <span>
                    <span className="block text-sm font-semibold">
                      Controlar duração dos serviços
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      Desligado, a duração some das telas.
                    </span>
                  </span>
                  <Switch
                    aria-label="Controlar duração dos serviços"
                    checked={usesDuration}
                    onCheckedChange={setUsesDuration}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
              </>
            )}

            {rows.map((r, i) => (
              <div key={i} className="space-y-2 rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={r.name}
                    maxLength={120}
                    aria-label={vendas ? "Nome do produto" : "Nome do serviço"}
                    placeholder={vendas ? "Nome do produto" : "Nome do serviço"}
                    onChange={(e) => update(i, { name: e.target.value })}
                  />
                  <button
                    type="button"
                    aria-label="Remover"
                    onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={r.price}
                    aria-label="Preço (R$)"
                    placeholder="Preço (R$)"
                    onChange={(e) => update(i, { price: e.target.value })}
                  />
                  {vendas ? (
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={r.stock}
                      aria-label="Em estoque (un.)"
                      placeholder="Em estoque"
                      onChange={(e) => update(i, { stock: e.target.value })}
                    />
                  ) : usesDuration ? (
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={r.duration}
                      aria-label="Duração (min)"
                      placeholder="Duração (min)"
                      onChange={(e) => update(i, { duration: e.target.value })}
                    />
                  ) : null}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRows((rs) => [...rs, row()])}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-secondary"
            >
              <Plus className="h-4 w-4" /> {vendas ? "Adicionar produto" : "Adicionar serviço"}
            </button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-xs text-muted-foreground">
              Escolha a cor do app. Toque para ver a prévia; dá para mudar depois em Configurações.
            </p>
            <div
              role="radiogroup"
              aria-label="Cor do app"
              className="grid grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              {themePalette.map((p) => {
                const active = color === p.color;
                return (
                  <button
                    key={p.color}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={p.name}
                    onClick={() => {
                      setColor(p.color);
                      previewThemeColor(p.color);
                    }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform ${
                        active
                          ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card"
                          : ""
                      }`}
                      style={{ backgroundColor: p.color }}
                    >
                      {active ? <Check className="h-5 w-5" /> : null}
                    </span>
                    <span className="text-center text-[10px] leading-tight text-muted-foreground">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            {[
              { k: "Empresa", v: name },
              { k: "Segmento", v: segment },
              { k: "Uso", v: vendas ? "Vendas e estoque" : "Atendimentos" },
              ...(vendas ? [] : [{ k: "Veículos", v: usesVehicle ? "Sim" : "Não" }]),
              ...(vendas ? [] : [{ k: "Duração", v: usesDuration ? "Controlada" : "Não usa" }]),
              {
                k: vendas ? "Produtos" : "Serviços",
                v: filled
                  .map((r) =>
                    vendas ? `${r.name} (${r.stock} un.)` : `${r.name} ${brl(parseMoney(r.price))}`,
                  )
                  .join(", "),
              },
              { k: "Cor", v: themePalette.find((p) => p.color === color)?.name ?? color },
            ].map((x) => (
              <div
                key={x.k}
                className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0"
              >
                <span className="text-xs text-muted-foreground">{x.k}</span>
                <span className="text-right text-sm font-semibold">{x.v || "—"}</span>
              </div>
            ))}
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
        {step < 3 ? (
          <PrimaryButton onClick={next}>Continuar</PrimaryButton>
        ) : (
          <PrimaryButton onClick={finish} disabled={saving} aria-busy={saving}>
            {saving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Concluir
              </>
            )}
          </PrimaryButton>
        )}
      </div>
    </PhoneShell>
  );
}
