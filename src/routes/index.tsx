import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useStoredAppIcon } from "@/lib/app-icon";
import { Field, PrimaryButton, inputClass } from "@/components/app/ui-bits";
import {
  changePassword,
  clearSession,
  forgotPassword,
  getSetupStatus,
  login,
  setupOwner,
} from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceFlow — Gestão para prestadores de serviço" },
      {
        name: "description",
        content:
          "ServiceFlow: agenda, atendimentos, clientes e financeiro em um só app para lava-rápidos e prestadores de serviço.",
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
  // Último ícone da empresa usado neste aparelho (gota se nunca entrou).
  const { Icon: AppIcon } = useStoredAppIcon();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [segment, setSegment] = useState("Estética Automotiva");
  const [ownerName, setOwnerName] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [setupAvailable, setSetupAvailable] = useState<boolean | null>(null);
  const [forceSetup, setForceSetup] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSetupStatus()
      .then(({ available }) => setSetupAvailable(available))
      .catch(() => setSetupAvailable(false));
  }, []);

  const showSetup = forceSetup || setupAvailable === true;
  const ready = forceSetup || setupAvailable !== null;

  return (
    <div className="min-h-screen bg-muted/60 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-card sm:min-h-[860px] sm:rounded-[2.25rem] sm:border sm:border-border">
        <div className="bg-brand px-6 pb-14 pt-16 text-primary-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent shadow-float">
            <AppIcon className="h-7 w-7" />
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
            if (!ready) return;
            setLoading(true);
            try {
              if (showSetup) {
                if (password !== passwordConfirmation) {
                  throw new Error("As senhas não coincidem");
                }
                await setupOwner({ companyName, segment, ownerName, email, password, inviteKey });
                const user = await login(email, password);
                window.dispatchEvent(new Event("serviceflow-auth"));
                toast.success(`Bem-vindo, ${user.name}!`);
                await navigate({ to: "/dashboard" });
                return;
              }
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
              toast.error(
                error instanceof Error ? error.message : "Não foi possível concluir o acesso",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {showSetup ? "Criar acesso do proprietário" : "Entrar"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showSetup
                ? "Cadastre sua empresa para começar a usar o ServiceFlow."
                : "Acesse o painel do seu estabelecimento."}
            </p>
          </div>

          {showSetup && (
            <>
              <Field label="Nome da empresa">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    maxLength={150}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Nome do estabelecimento"
                    autoComplete="organization"
                  />
                </div>
              </Field>

              <Field label="Segmento">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    maxLength={100}
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Ex.: Estética Automotiva"
                  />
                </div>
              </Field>

              <Field label="Nome do proprietário">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    maxLength={150}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </div>
              </Field>

              <Field label="Chave de convite">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    maxLength={100}
                    value={inviteKey}
                    onChange={(e) => setInviteKey(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Chave fornecida pela ServiceFlow"
                    autoComplete="off"
                  />
                </div>
              </Field>
            </>
          )}

          <Field label="E-mail ou identificador">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                maxLength={180}
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
                minLength={showSetup ? 12 : undefined}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="••••••"
                autoComplete={showSetup ? "new-password" : "current-password"}
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

          {showSetup && (
            <>
              <Field label="Confirmar senha">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={show ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={72}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </Field>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Recomendamos usar um e-mail real para facilitar a recuperação de acesso. A senha
                deve ter pelo menos 12 caracteres.
              </p>
            </>
          )}

          {!showSetup && (
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast.error("Informe seu e-mail ou identificador");
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
          )}

          <PrimaryButton type="submit" disabled={loading || !ready}>
            {!ready
              ? "Verificando cadastro..."
              : loading
                ? showSetup
                  ? "Criando cadastro..."
                  : "Entrando..."
                : showSetup
                  ? "Criar cadastro"
                  : "Entrar"}
          </PrimaryButton>

          <button
            type="button"
            onClick={() => setForceSetup((v) => !v)}
            className="pb-2 text-center text-[11px] text-muted-foreground underline"
          >
            {showSetup ? "Já tenho uma empresa cadastrada" : "Cadastrar outra empresa"}
          </button>

          <p className="pb-8 pt-2 text-center text-[11px] text-muted-foreground">
            ServiceFlow • Plataforma de gestão para prestadores de serviço
          </p>
        </form>
      </div>
    </div>
  );
}
