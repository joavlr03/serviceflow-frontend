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
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Produtos e estoque | ServiceFlow" },
      {
        name: "description",
        content: "Cadastre seus produtos e acompanhe a quantidade em estoque.",
      },
    ],
  }),
  component: Estoque,
});

const emptyForm = { name: "", price: "", stock: "0", active: true };

const errorMessage = (error: unknown) =>
  error instanceof ApiError && error.status === 403
    ? "Só o dono da empresa pode alterar os produtos"
    : error instanceof Error
      ? error.message
      : "Não foi possível salvar o produto";

function Estoque() {
  const { products, saveProduct, deleteProduct } = useStore();
  // null = fechado; "" = novo produto; id = editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalUnits = products.filter((p) => p.active).reduce((s, p) => s + p.stock, 0);

  const open = (p?: Product) => {
    setEditingId(p?.id ?? "");
    setForm(
      p
        ? {
            name: p.name,
            price: p.price.toFixed(2).replace(".", ","),
            stock: String(p.stock),
            active: p.active,
          }
        : emptyForm,
    );
  };
  const close = () => setEditingId(null);

  const save = async () => {
    const price = parseMoney(form.price);
    const stock = Number(form.stock);
    const invalid = !form.name.trim()
      ? "Informe o nome do produto"
      : !form.price.trim() || price < 0
        ? "Informe um preço válido"
        : !Number.isInteger(stock) || stock < 0
          ? "O estoque deve ser um número inteiro, zero ou maior"
          : null;
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setSaving(true);
    try {
      await saveProduct(editingId || null, {
        name: form.name.trim(),
        price,
        stock,
        active: form.active,
      });
      toast.success("Produto salvo");
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
      await deleteProduct(editingId);
      toast.success("Produto excluído");
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <PhoneShell fab={false}>
      <TopBar
        title="Produtos e estoque"
        subtitle={`${products.length} produtos • ${totalUnits} unidades`}
        backTo="/dashboard"
        action={
          <button
            onClick={() => open()}
            aria-label="Novo produto"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <section className="space-y-2.5 px-5 pb-8 pt-4">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => open(p)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-card ${
              p.active ? "" : "opacity-60"
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{p.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {brl(p.price)}
                {p.active ? "" : " • Inativo"}
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-bold ${p.stock === 0 ? "text-destructive" : ""}`}
            >
              {p.stock === 0 ? "Sem estoque" : `${p.stock} un.`}
            </span>
          </button>
        ))}

        {products.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Toque no + para cadastrar o primeiro produto e a quantidade em estoque."
          />
        ) : null}
        <p className="pt-1 text-[11px] text-muted-foreground">
          O estoque baixa quando a venda é finalizada e volta se ela for cancelada ou reaberta.
        </p>
      </section>

      {editingId !== null ? (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/40">
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-[1.75rem] bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingId ? "Editar produto" : "Novo produto"}
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
                  placeholder="Ex.: Cera líquida 500 ml"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$)">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Em estoque (un.)">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
                <span>
                  <span className="block text-sm font-semibold">Ativo</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Inativo não aparece na nova venda, mas fica no histórico.
                  </span>
                </span>
                <Switch
                  aria-label="Produto ativo"
                  checked={form.active}
                  onCheckedChange={(active) => setForm({ ...form, active })}
                  className="data-[state=checked]:bg-secondary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ajuste o estoque aqui ao repor ou contar as unidades. Mudar o preço vale só para as
                próximas vendas.
              </p>
              <PrimaryButton onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar produto"}
              </PrimaryButton>
              {editingId ? (
                <GhostButton onClick={() => setConfirmDelete(true)} className="text-destructive">
                  Excluir produto
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
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Produto que já foi vendido não pode ser excluído; nesse caso, desative-o.
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
