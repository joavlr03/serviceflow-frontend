import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field, PrimaryButton, inputClass } from "@/components/app/ui-bits";
import { supportResetPassword } from "@/lib/api-client";

export const Route = createFileRoute("/suporte")({ component: SupportPage });

function SupportPage() {
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [supportKey, setSupportKey] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-muted/60 px-4 py-8">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-border bg-background shadow-card">
        <header className="bg-brand px-7 py-8 text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">Suporte de acesso</h1>
          <p className="mt-1 text-sm opacity-75">
            Defina uma senha temporária para uma conta existente.
          </p>
        </header>

        <form
          className="space-y-5 p-7"
          onSubmit={async (event) => {
            event.preventDefault();
            if (temporaryPassword !== confirmation) {
              toast.error("As senhas não coincidem");
              return;
            }
            setLoading(true);
            try {
              const result = await supportResetPassword(supportKey, email, temporaryPassword);
              toast.success(result.message);
              setTemporaryPassword("");
              setConfirmation("");
              setSupportKey("");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Não foi possível redefinir a senha",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs leading-relaxed text-foreground">
            A chave de suporte não é armazenada. As sessões antigas serão encerradas e o usuário
            deverá criar uma senha definitiva no próximo login.
          </div>

          <Field label="E-mail do proprietário">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="cliente@empresa.com"
              />
            </div>
          </Field>

          <Field label="Senha temporária" hint="Use no mínimo 8 caracteres.">
            <input
              type={showSecrets ? "text" : "password"}
              required
              minLength={8}
              value={temporaryPassword}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>

          <Field label="Confirme a senha temporária">
            <input
              type={showSecrets ? "text" : "password"}
              required
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>

          <Field label="Chave secreta do suporte">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showSecrets ? "text" : "password"}
                required
                value={supportKey}
                onChange={(event) => setSupportKey(event.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                autoComplete="off"
              />
              <button
                type="button"
                aria-label="Mostrar ou ocultar dados secretos"
                onClick={() => setShowSecrets((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Redefinindo..." : "Definir senha temporária"}
          </PrimaryButton>

          <Link to="/" className="block text-center text-sm font-semibold text-secondary">
            Voltar para o login
          </Link>
        </form>
      </section>
    </main>
  );
}
