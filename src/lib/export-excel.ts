import writeExcelFile from "write-excel-file/browser";
import type { Cell, Row } from "write-excel-file/browser";
import { paymentText, statusMap } from "@/components/app/ui-bits";
import type { Client, Company, Expense, ServiceOrder, ServiceType, Vehicle } from "./types";

// Nomes dos campos da planilha universal. A estrutura é a mesma para toda empresa; só os nomes mudam.
// shortcut: um único mapa para todos os segmentos; vira mapa por segmento/empresa quando aparecer o primeiro caso diferente.
export const termos = {
  atendimento: "Atendimento",
  atendimentos: "Atendimentos",
  cliente: "Cliente",
  veiculo: "Veículo",
  servico: "Serviço",
  despesas: "Despesas",
};

export interface ExportInput {
  company: Company;
  from: string; // yyyy-MM-dd
  to: string;
  orders: ServiceOrder[];
  expenses: Expense[];
  summary: {
    realized: number;
    forecast: number;
    exp: number;
    profit: number;
    finished: number;
    canceled: number;
    ticket: number;
  };
  clientById: (id: string) => Client | undefined;
  vehicleById: (id: string) => Vehicle | undefined;
  serviceById: (id: string) => ServiceType | undefined;
}

const MOEDA = '"R$" #,##0.00';
const DATA = "dd/mm/yyyy";
const bold = (value: string): Cell => ({ value, fontWeight: "bold" });
const money = (value: number): Cell => ({ value, format: MOEDA });
const moneyBold = (value: number): Cell => ({ value, format: MOEDA, fontWeight: "bold" });
// Meia-noite UTC: a lib converte a data pelo horário UTC, então a data local poderia virar o dia anterior.
const date = (iso: string): Cell => ({ value: new Date(`${iso}T00:00:00Z`), format: DATA });
const br = (iso: string) => iso.split("-").reverse().join("/");

export function buildSheets(x: ExportInput) {
  // Coluna de veículo só entra se a empresa usa veículo (hoje: se algum atendimento do período tem um).
  const usaVeiculo = x.orders.some((o) => o.vehicleId);
  const orders = [...x.orders].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  const expenses = [...x.expenses].sort((a, b) => (a.date < b.date ? -1 : 1));
  const s = x.summary;

  const resumo: Row[] = [
    [bold(x.company.name || "ServiceFlow")],
    [`Período: ${br(x.from)} a ${br(x.to)}`],
    [],
    [bold("Indicador"), bold("Valor")],
    ["Receita realizada", money(s.realized)],
    ["Receita prevista", money(s.forecast)],
    [termos.despesas, money(s.exp)],
    [bold("Lucro"), moneyBold(s.profit)],
    [`${termos.atendimentos} finalizados`, s.finished],
    ["Cancelamentos", s.canceled],
    ["Ticket médio", money(s.ticket)],
  ];

  const headAt = [
    "Código",
    "Data",
    "Horário",
    termos.cliente,
    ...(usaVeiculo ? [termos.veiculo] : []),
    termos.servico,
    "Status",
    "Pagamento",
    "Valor",
  ];
  const atendimentos: Row[] = [
    headAt.map(bold),
    ...orders.map((o): Row => {
      const v = x.vehicleById(o.vehicleId);
      return [
        o.code,
        date(o.date),
        o.time,
        x.clientById(o.clientId)?.name ?? "",
        ...(usaVeiculo ? [v ? `${v.brand} ${v.model} ${v.plate}`.trim() : ""] : []),
        x.serviceById(o.serviceId)?.name ?? "",
        statusMap[o.status].label,
        paymentText(o),
        money(o.price),
      ];
    }),
    [],
    [
      { value: "Total realizado (finalizados)", fontWeight: "bold", columnSpan: headAt.length - 1 },
      ...Array(headAt.length - 2).fill(null),
      moneyBold(s.realized),
    ],
  ];

  const despesas: Row[] = [
    ["Data", "Descrição", "Categoria", "Observação", "Valor"].map(bold),
    ...expenses.map((e): Row => [
      date(e.date),
      e.description,
      e.category,
      e.notes ?? "",
      money(e.amount),
    ]),
    [],
    [{ value: "Total", fontWeight: "bold", columnSpan: 4 }, null, null, null, moneyBold(s.exp)],
  ];

  const w = (...widths: number[]) => widths.map((width) => ({ width }));
  return [
    { data: resumo, sheet: "Resumo", columns: w(28, 18) },
    {
      data: atendimentos,
      sheet: termos.atendimentos,
      columns: w(10, 12, 9, 24, ...(usaVeiculo ? [24] : []), 22, 12, 16, 14),
      stickyRowsCount: 1,
    },
    { data: despesas, sheet: termos.despesas, columns: w(12, 28, 18, 28, 14), stickyRowsCount: 1 },
  ];
}

export async function exportarPeriodo(x: ExportInput) {
  await writeExcelFile(buildSheets(x)).toFile(`financeiro_${x.from}_a_${x.to}.xlsx`);
}
