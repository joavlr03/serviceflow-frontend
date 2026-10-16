import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Users, Wallet, Plus } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ensureSession } from "@/lib/api-client";
import { useTermos } from "@/lib/termos";

const tabs = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
];

export function PhoneShell({
  children,
  bottomNav = true,
  fab = true,
}: {
  children: ReactNode;
  bottomNav?: boolean;
  fab?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useTermos();
  useEffect(() => {
    void ensureSession().then((ok) => {
      if (!ok) window.location.href = "/";
    });
  }, []);

  return (
    <div className="min-h-screen bg-muted/60 py-0 sm:py-8">
      <div className="mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-card sm:min-h-[860px] sm:rounded-[2.25rem] sm:border sm:border-border">
        <div className="relative flex min-h-screen flex-1 flex-col sm:min-h-[860px]">
          <div className="flex-1 overflow-y-auto pb-28">{children}</div>

          {fab ? (
            <Link
              to="/os/nova"
              aria-label={t.novo}
              className="absolute bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-secondary-foreground shadow-float transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </Link>
          ) : null}

          {bottomNav ? (
            <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-border bg-card/95 px-2 pb-4 pt-2 backdrop-blur">
              {tabs.map((tab) => {
                const active = pathname.startsWith(tab.to);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors ${
                      active ? "text-secondary" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                        active ? "bg-secondary/12" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
