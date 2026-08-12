import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/suporte")({ component: SupportPage });

function SupportPage() {
  return (
    <main className="min-h-screen bg-muted/60 px-4 py-8">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-border bg-background shadow-card">
        <header className="bg-brand px-7 py-8 text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">Suporte de acesso</h1>
          <p className="mt-1 text-sm opacity-75">Recuperação segura de acesso.</p>
        </header>

        <div className="space-y-5 p-7">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A redefinição por chave de suporte foi desativada. Use a opção “Esqueci minha senha” na
            tela de login para solicitar a recuperação.
          </p>
          <Link to="/" className="block text-center text-sm font-semibold text-secondary">
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
