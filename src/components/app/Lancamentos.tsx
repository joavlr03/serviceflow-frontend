import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
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
import { brl, formatDate, parseMoney, todayISO } from "@/lib/format";
import type { Category } from "@/lib/types";

// Despesas e entradas avulsas têm o mesmo formato; só mudam os textos, a lista e o sinal.
const textos = {
  DESPESA: {
    titulo: "Despesas",
    novo: "Nova despesa",
    vazio: "Sem despesas",
    vazioDica: "Registre os gastos para calcular o lucro.",
    exemplo: "Ex.: Shampoo automotivo",
    sinal: "-",
    cor: "text-secondary",
    salvar: "Salvar despesa",
    salvo: "Despesa registrada",
    erro: "Não foi possível salvar a despesa",
    semCategoria: "Cadastre uma categoria em Configurações → Categorias",
  },
  ENTRADA: {
    titulo: "Entradas",
    novo: "Nova entrada",
    vazio: "Sem entradas",
    vazioDica: "Registre vendas, comissões e outras receitas que não vêm de atendimento.",
    exemplo: "Ex.: Venda de cera",
    sinal: "+",
    cor: "text-emerald-600",
    salvar: "Salvar entrada",
    salvo: "Entrada registrada",
    erro: "Não foi possível salvar a entrada",
    semCategoria: "Cadastre uma categoria em Configurações → Categorias",
  },
};

const emptyForm = { description: "", category: "", amount: "", date: todayISO(), notes: "" };

export function Lancamentos({ kind }: { kind: Category["type"] }) {
  const { expenses, incomes, addExpense, addIncome, categories } = useStore();
  const t = textos[kind];
  const items = kind === "DESPESA" ? expenses : incomes;
  const save = kind === "DESPESA" ? addExpense : addIncome;
  const active = categories.filter((c) => c.active && c.type === kind);
  const [open, setOpen] = useState(false);
  // category "" = primeira categoria ativa
  const [form, setForm] = useState(emptyForm);

  const total = items.reduce((s, e) => s + e.amount, 0);
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar
        title={t.titulo}
        subtitle={`${items.length} lançamentos • ${brl(total)}`}
        backTo="/financeiro"
        action={
          <button
            onClick={() => setOpen(true)}
            aria-label={t.novo}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <section className="space-y-2.5 px-5 pb-10 pt-4">
        {sorted.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{e.description}</p>
                <p className="text-xs text-muted-foreground">
                  {e.category} • {formatDate(e.date)}
                </p>
              </div>
              <span className={`shrink-0 text-sm font-bold ${t.cor}`}>
                {t.sinal} {brl(e.amount)}
              </span>
            </div>
            {e.notes ? <p className="mt-2 text-xs text-muted-foreground">{e.notes}</p> : null}
          </div>
        ))}
        {sorted.length === 0 ? <EmptyState title={t.vazio} description={t.vazioDica} /> : null}
      </section>

      {open ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[88%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">{t.novo}</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Descrição">
                <input
                  className={inputClass}
                  value={form.description}
                  maxLength={180}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t.exemplo}
                />
              </Field>
              <Field label="Categoria">
                <select
                  className={inputClass}
                  value={form.category || active[0]?.name || ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {active.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Link
                  to="/categorias"
                  search={{ tipo: kind }}
                  className="mt-1 block text-[11px] font-semibold text-secondary"
                >
                  Gerenciar categorias
                </Link>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$)">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputClass}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </Field>
                <Field label="Data">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Observação">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
              <PrimaryButton
                onClick={async () => {
                  const amount = parseMoney(form.amount);
                  const category = form.category || active[0]?.name;
                  if (!category) {
                    toast.error(t.semCategoria);
                    return;
                  }
                  if (!form.description.trim() || amount <= 0 || !form.date) {
                    toast.error("Informe a descrição, um valor maior que zero e a data");
                    return;
                  }
                  try {
                    await save({
                      description: form.description.trim(),
                      category,
                      amount,
                      date: form.date,
                      notes: form.notes.trim(),
                    });
                    setForm({ ...emptyForm, date: todayISO() });
                    setOpen(false);
                    toast.success(t.salvo);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : t.erro);
                  }
                }}
              >
                {t.salvar}
              </PrimaryButton>
              <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
            </div>
          </div>
        </div>
      ) : null}
    </PhoneShell>
  );
}
