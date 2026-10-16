import { createFileRoute } from "@tanstack/react-router";
import { Lancamentos } from "@/components/app/Lancamentos";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas | ServiceFlow" },
      {
        name: "description",
        content: "Registre produtos, contas, aluguel e demais gastos para calcular o lucro real.",
      },
      { property: "og:title", content: "Despesas | ServiceFlow" },
      { property: "og:description", content: "Controle de gastos do seu estabelecimento." },
    ],
  }),
  component: () => <Lancamentos kind="DESPESA" />,
});
