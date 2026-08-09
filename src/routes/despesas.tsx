import { createFileRoute } from "@tanstack/react-router";
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
import { brl, formatDate, todayISO } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/types";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas | ServiceFlow" },
      {
        name: "description",
        content: "Registre produtos, contas, aluguel e demais gastos para calcular o lucro real.",
      },
      { property: "og:title", content: "Despesas | ServiceFlow" },
      { property: "og:description", content: "Controle de gastos do seu estabelecimento." },
    ],
  }),
  component: Despesas,
});

const categories: ExpenseCategory[] = [
  "Produtos",
  "Água e Energia",
  "Aluguel",
  "Funcionários",
  "Manutenção",
  "Impostos",
  "Fornecedores",
  "Outros",
];

function Despesas() {
  const { expenses, addExpense } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    category: "Produtos" as ExpenseCategory,
    amount: "",
    date: todayISO(),
    notes: "",
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <PhoneShell fab={false} bottomNav={false}>
      <TopBar
        title="Despesas"
        subtitle={`${expenses.length} lançamentos • ${brl(total)}`}
        backTo="/financeiro"
        action={
          <button
            onClick={() => setOpen(true)}
            aria-label="Nova despesa"
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
              <span className="shrink-0 text-sm font-bold text-secondary">- {brl(e.amount)}</span>
            </div>
            {e.notes ? <p className="mt-2 text-xs text-muted-foreground">{e.notes}</p> : null}
          </div>
        ))}
        {sorted.length === 0 ? (
          <EmptyState
            title="Sem despesas"
            description="Registre os gastos para calcular o lucro."
          />
        ) : null}
      </section>

      {open ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[88%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Nova despesa</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Descrição">
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex.: Shampoo automotivo"
                />
              </Field>
              <Field label="Categoria">
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ExpenseCategory })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$)">
                  <input
                    type="number"
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
                  if (!form.description.trim() || !form.amount) return;
                  await addExpense({
                    description: form.description,
                    category: form.category,
                    amount: Number(form.amount) || 0,
                    date: form.date,
                    notes: form.notes,
                  });
                  setForm({
                    description: "",
                    category: "Produtos",
                    amount: "",
                    date: todayISO(),
                    notes: "",
                  });
                  setOpen(false);
                  toast.success("Despesa registrada");
                }}
              >
                Salvar despesa
              </PrimaryButton>
              <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
            </div>
          </div>
        </div>
      ) : null}
    </PhoneShell>
  );
}
