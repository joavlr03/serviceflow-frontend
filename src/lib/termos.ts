import { useStore } from "./store";
import type { Company } from "./types";

// Termos das telas e do Excel por modo de uso da empresa. Modo vendas troca "atendimento" por "venda".
export const termosPorModo = {
  SERVICOS: {
    atendimento: "atendimento",
    Atendimento: "Atendimento",
    atendimentos: "atendimentos",
    Atendimentos: "Atendimentos",
    novo: "Novo atendimento",
    nenhum: "Nenhum atendimento",
    o: "o", // final de adjetivo: registrado / registrada
    prefixo: "AT",
  },
  VENDAS: {
    atendimento: "venda",
    Atendimento: "Venda",
    atendimentos: "vendas",
    Atendimentos: "Vendas",
    novo: "Nova venda",
    nenhum: "Nenhuma venda",
    o: "a",
    prefixo: "VD",
  },
};

export type Termos = (typeof termosPorModo)["SERVICOS"] & { codigo: (code: string) => string };

export function termosDe(company: Pick<Company, "usageMode">): Termos {
  const t = termosPorModo[company.usageMode ?? "SERVICOS"];
  // A API gera "OS-1042" e o api-client mostra "AT-1042"; venda vira "VD-1042".
  return { ...t, codigo: (code) => code.replace(/^AT-/, `${t.prefixo}-`) };
}

export function useTermos(): Termos {
  return termosDe(useStore().company);
}
