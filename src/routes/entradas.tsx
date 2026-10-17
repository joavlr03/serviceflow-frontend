import { createFileRoute } from "@tanstack/react-router";
import { Lancamentos } from "@/components/app/Lancamentos";

export const Route = createFileRoute("/entradas")({
  head: () => ({
    meta: [
      { title: "Entradas | ServiceFlow" },
      {
        name: "description",
        content: "Registre vendas, comissões e outras receitas que não vêm de atendimento.",
      },
    ],
  }),
  component: () => <Lancamentos kind="ENTRADA" />,
});
