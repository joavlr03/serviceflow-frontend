import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Field, PrimaryButton, inputClass } from "@/components/app/ui-bits";
import { changePassword, clearSession, forgotPassword, login } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceFlow — Gestão para prestadores de serviço" },
      {
        name: "description",
        content:
          "ServiceFlow: agenda, ordens de serviço, clientes e financeiro em um só app para lava-rápidos e prestadores de serviço.",
      },
      { property: "og:title", content: "ServiceFlow — Gestão para prestadores de serviço" },
      {
        property: "og:description",
        content: "Agende, organize clientes e acompanhe o faturamento do seu negócio de serviços.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-muted/60 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-card sm:min-h-[860px] sm:rounded-[2.25rem] sm:border sm:border-border">
        <div className="bg-brand px-6 pb-14 pt-16 text-primary-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent shadow-float">
            <Droplets className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">ServiceFlow</h1>
          <p className="mt-2 max-w-[16rem] text-sm opacity-75">
            Sua operação de serviços organizada em um só lugar.
          </p>
        </div>

        <form
          className="-mt-8 flex-1 space-y-4 rounded-t-[2rem] bg-background px-6 pt-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const user = await login(email, password);
              if (user.passwordChangeRequired) {
                const next = window.prompt("Crie uma nova senha definitiva (mínimo 12 caracteres)");
                const confirmation = window.prompt("Digite novamente a nova senha definitiva");
                if (!next || next.length < 12) {
                  clearSession();
                  throw new Error("É necessário definir uma nova senha");
                }
                if (next !== confirmation) {
                  clearSession();
                  throw new Error("As novas senhas não coincidem");
                }
                await changePassword(password, next);
                clearSession();
                setPassword("");
                toast.success("Senha alterada. Entre novamente.");
                return;
              }
              window.dispatchEvent(new Event("serviceflow-auth"));
              await navigate({ to: "/dashboard" });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Não foi possível entrar");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight">Entrar</h2>
            <p className="text-sm text-muted-foreground">Acesse o painel do seu estabelecimento.</p>
          </div>

          <Field label="E-mail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="seu@email.com"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
          </Field>

          <Field label="Senha">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="••••••"
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
              />
              <button
                type="button"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <button
            type="button"
            onClick={async () => {
              if (!email) {
                toast.error("Informe seu e-mail");
                return;
              }
              try {
                const r = await forgotPassword(email);
                toast.success(r.message);
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Falha ao solicitar recuperação",
                );
              }
            }}
            className="text-xs font-semibold text-secondary"
          >
            Esqueci minha senha
          </button>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </PrimaryButton>

          <p className="pb-8 pt-2 text-center text-[11px] text-muted-foreground">
            ServiceFlow • Plataforma de gestão para prestadores de serviço
          </p>
        </form>
      </div>
    </div>
  );
}
