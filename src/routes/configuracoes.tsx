import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Tag, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/app/PhoneShell";
import { PrimaryButton, TopBar } from "@/components/app/ui-bits";
import { ApiError } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { DEFAULT_THEME_COLOR, previewThemeColor, themePalette } from "@/lib/theme";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | ServiceFlow" },
      { name: "description", content: "Personalize o ServiceFlow da sua empresa." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { company, setThemeColor } = useStore();
  const saved = (company.themeColor ?? DEFAULT_THEME_COLOR).toUpperCase();
  const [choice, setChoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const selected = choice ?? saved;

  // Ao sair sem salvar, a prévia volta para a cor salva.
  const savedRef = useRef(company.themeColor);
  savedRef.current = company.themeColor;
  useEffect(() => () => previewThemeColor(savedRef.current), []);

  const pick = (color: string) => {
    setChoice(color);
    previewThemeColor(color);
  };

  const save = async () => {
    setSaving(true);
    try {
      await setThemeColor(selected);
      setChoice(null);
      toast.success("Cor do app atualizada");
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 403
          ? "Só o dono da empresa pode alterar a cor do app"
          : error instanceof Error
            ? error.message
            : "Não foi possível salvar a cor",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneShell fab={false}>
      <TopBar title="Configurações" subtitle={company.name} backTo="/dashboard" />

      <section className="px-5 pt-5">
        <Link
          to="/servicos"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Tag className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Serviços e preços</p>
            <p className="text-xs text-muted-foreground">Cadastre o que sua empresa oferece</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          to="/categorias"
          className="mt-2.5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Receipt className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Categorias de despesa</p>
            <p className="text-xs text-muted-foreground">Organize seus gastos do seu jeito</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      <section className="px-5 pt-5">
        <h2 className="text-sm font-bold">Cor do app</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Toque numa cor para ver a prévia. Ela vale para todos os usuários da empresa.
        </p>

        <div
          role="radiogroup"
          aria-label="Cor do app"
          className="mt-4 grid grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          {themePalette.map((p) => {
            const active = selected === p.color;
            return (
              <button
                key={p.color}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={p.name}
                onClick={() => pick(p.color)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform ${
                    active ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
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

        <div className="mt-5">
          <PrimaryButton onClick={save} disabled={saving || selected === saved}>
            {saving ? "Salvando..." : "Salvar cor"}
          </PrimaryButton>
        </div>
      </section>
    </PhoneShell>
  );
}
