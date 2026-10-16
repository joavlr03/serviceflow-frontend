import { createFileRoute, Link } from "@tanstack/react-router";
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
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias | ServiceFlow" },
      {
        name: "description",
        content: "Cadastre as categorias de despesa e de entrada da sua empresa.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { tipo?: Category["type"] } =>
    s["tipo"] === "ENTRADA" ? { tipo: "ENTRADA" } : {},
  component: Categorias,
});

const emptyForm = { name: "", active: true };

const errorMessage = (error: unknown) =>
  error instanceof ApiError && error.status === 403
    ? "Só o dono da empresa pode alterar as categorias"
    : error instanceof Error
      ? error.message
      : "Não foi possível salvar a categoria";

function Categorias() {
  const { categories: all, saveCategory, deleteCategory } = useStore();
  const type = Route.useSearch().tipo ?? "DESPESA";
  const categories = all.filter((c) => c.type === type);
  // null = fechado; "" = nova categoria; id = editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [originalName, setOriginalName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const open = (c?: Category) => {
    setEditingId(c?.id ?? "");
    setForm(c ? { name: c.name, active: c.active } : emptyForm);
    setOriginalName(c?.name ?? "");
  };
  const close = () => setEditingId(null);

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }
    setSaving(true);
    try {
      await saveCategory(editingId || null, {
        name: form.name.trim(),
        type,
        active: form.active,
      });
      toast.success("Categoria salva");
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
      await deleteCategory(editingId);
      toast.success("Categoria excluída");
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const renaming = editingId && originalName && form.name.trim() !== originalName;

  return (
    <PhoneShell fab={false}>
      <TopBar
        title="Categorias"
        subtitle={`${categories.length} cadastradas`}
        backTo="/configuracoes"
        action={
          <button
            onClick={() => open()}
            aria-label="Nova categoria"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex gap-2 px-5 pt-4">
        {(
          [
            ["DESPESA", "Despesa"],
            ["ENTRADA", "Entrada"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            to="/categorias"
            search={key === "ENTRADA" ? { tipo: key } : {}}
            onClick={close}
            className={`flex-1 rounded-full py-2 text-center text-xs font-semibold transition-colors ${
              type === key
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <section className="space-y-2.5 px-5 pb-8 pt-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => open(c)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-card ${
              c.active ? "" : "opacity-60"
            }`}
          >
            <span className="truncate text-sm font-semibold">{c.name}</span>
            {c.active ? null : (
              <span className="shrink-0 text-[11px] text-muted-foreground">Inativa</span>
            )}
          </button>
        ))}

        {categories.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria cadastrada"
            description="Toque no + para cadastrar a primeira categoria."
          />
        ) : null}
      </section>

      {editingId !== null ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingId ? "Editar categoria" : "Nova categoria"}
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
                  maxLength={40}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Marketing"
                />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
                <span>
                  <span className="block text-sm font-semibold">Ativa</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Inativa não aparece ao lançar, mas fica no histórico.
                  </span>
                </span>
                <Switch
                  aria-label="Categoria ativa"
                  checked={form.active}
                  onCheckedChange={(active) => setForm({ ...form, active })}
                  className="data-[state=checked]:bg-secondary"
                />
              </div>
              {renaming ? (
                <p className="text-[11px] text-muted-foreground">
                  Os lançamentos já feitos em "{originalName}" passam para o novo nome.
                </p>
              ) : null}
              <PrimaryButton onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar categoria"}
              </PrimaryButton>
              {editingId ? (
                <GhostButton onClick={() => setConfirmDelete(true)} className="text-destructive">
                  Excluir categoria
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
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Categoria que já foi usada em algum lançamento não pode ser excluída; nesse caso,
              desative-a.
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
