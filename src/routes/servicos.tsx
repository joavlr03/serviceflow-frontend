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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { brl, parseMoney } from "@/lib/format";
import type { ServiceType } from "@/lib/types";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços e preços | ServiceFlow" },
      { name: "description", content: "Cadastre os serviços da sua empresa e ajuste os preços." },
    ],
  }),
  component: Servicos,
});

const emptyForm = { name: "", price: "", durationMin: "60", active: true };

const errorMessage = (error: unknown) =>
  error instanceof ApiError && error.status === 403
    ? "Só o dono da empresa pode alterar os serviços"
    : error instanceof Error
      ? error.message
      : "Não foi possível salvar o serviço";

function Servicos() {
  const { services, saveService, deleteService, company } = useStore();
  // Empresa que desligou a duração no primeiro acesso não vê nem edita o campo.
  const usaDuracao = company.usesDuration !== false;
  // null = fechado; "" = novo serviço; id = editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const open = (s?: ServiceType) => {
    setEditingId(s?.id ?? "");
    setForm(
      s
        ? {
            name: s.name,
            price: s.price.toFixed(2).replace(".", ","),
            durationMin: String(s.durationMin),
            active: s.active,
          }
        : emptyForm,
    );
  };
  const close = () => setEditingId(null);

  const save = async () => {
    const price = parseMoney(form.price);
    const durationMin = Number(form.durationMin);
    const invalid = !form.name.trim()
      ? "Informe o nome do serviço"
      : !form.price.trim() || price < 0
        ? "Informe um preço válido"
        : usaDuracao && (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 1440)
          ? "A duração deve ser entre 1 e 1440 minutos"
          : null;
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setSaving(true);
    try {
      await saveService(editingId || null, {
        name: form.name.trim(),
        price,
        durationMin,
        active: form.active,
      });
      toast.success("Serviço salvo");
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editingId) return;
    try {
      await deleteService(editingId);
      toast.success("Serviço excluído");
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <PhoneShell fab={false}>
      <TopBar
        title="Serviços e preços"
        subtitle={`${services.length} cadastrados`}
        backTo="/configuracoes"
        action={
          <button
            onClick={() => open()}
            aria-label="Novo serviço"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <section className="space-y-2.5 px-5 pb-8 pt-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => open(s)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-card ${
              s.active ? "" : "opacity-60"
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{s.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {[usaDuracao ? `${s.durationMin} min` : "", s.active ? "" : "Inativo"]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold">{brl(s.price)}</span>
          </button>
        ))}

        {services.length === 0 ? (
          <EmptyState
            title="Nenhum serviço cadastrado"
            description="Toque no + para cadastrar o primeiro serviço da sua empresa."
          />
        ) : null}
      </section>

      {editingId !== null ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingId ? "Editar serviço" : "Novo serviço"}
              </h2>
              <button onClick={close} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={form.name}
                  maxLength={120}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Corte de cabelo"
                />
              </Field>
              <div className={usaDuracao ? "grid grid-cols-2 gap-3" : ""}>
                <Field label="Preço (R$)">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0,00"
                  />
                </Field>
                {usaDuracao ? (
                  <Field label="Duração (min)">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={form.durationMin}
                      onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                    />
                  </Field>
                ) : null}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
                <span>
                  <span className="block text-sm font-semibold">Ativo</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Inativo não aparece no novo atendimento, mas fica no histórico.
                  </span>
                </span>
                <Switch
                  aria-label="Serviço ativo"
                  checked={form.active}
                  onCheckedChange={(active) => setForm({ ...form, active })}
                  className="data-[state=checked]:bg-secondary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Mudar o preço vale só para os próximos atendimentos.
              </p>
              <PrimaryButton onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar serviço"}
              </PrimaryButton>
              {editingId ? (
                <GhostButton onClick={() => setConfirmDelete(true)} className="text-destructive">
                  Excluir serviço
                </GhostButton>
              ) : null}
              <GhostButton onClick={close}>Cancelar</GhostButton>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Serviço que já foi usado em algum atendimento não pode ser excluído; nesse caso,
              desative-o.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void remove()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PhoneShell>
  );
}
