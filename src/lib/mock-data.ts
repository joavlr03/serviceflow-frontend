import type { Client, Company, Expense, ServiceOrder, ServiceType, Vehicle } from "./types";

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const company: Company = {
  id: "emp-1",
  name: "Lava-Rápido Brilho Total",
  segment: "Estética Automotiva",
  ownerName: "Carlos Menezes",
  email: "admin@brilhototal.com.br",
  plan: "Operacional + Financeiro",
};

export const services: ServiceType[] = [
  { id: "s1", name: "Lavagem Simples", price: 45, durationMin: 40 },
  { id: "s2", name: "Lavagem Completa", price: 80, durationMin: 70 },
  { id: "s3", name: "Polimento", price: 220, durationMin: 180 },
  { id: "s4", name: "Higienização Interna", price: 160, durationMin: 120 },
  { id: "s5", name: "Cera Premium", price: 120, durationMin: 90 },
];

export const clients: Client[] = [
  {
    id: "c1",
    name: "João Ribeiro",
    phone: "(11) 98812-4455",
    whatsapp: "(11) 98812-4455",
    notes: "Prefere atendimento pela manhã.",
    createdAt: "2026-02-11",
  },
  {
    id: "c2",
    name: "Marina Alves",
    phone: "(11) 99671-0032",
    whatsapp: "(11) 99671-0032",
    createdAt: "2026-03-04",
  },
  {
    id: "c3",
    name: "Rodrigo Tavares",
    phone: "(11) 98220-7781",
    whatsapp: "(11) 98220-7781",
    notes: "Cliente da frota da padaria do bairro.",
    createdAt: "2026-01-19",
  },
  {
    id: "c4",
    name: "Patrícia Nunes",
    phone: "(11) 99145-3390",
    whatsapp: "(11) 99145-3390",
    createdAt: "2026-05-27",
  },
  {
    id: "c5",
    name: "Eduardo Lima",
    phone: "(11) 98003-1177",
    whatsapp: "(11) 98003-1177",
    createdAt: "2026-06-30",
  },
];

export const vehicles: Vehicle[] = [
  { id: "v1", clientId: "c1", brand: "Honda", model: "Civic", plate: "FQR-2C18", color: "Prata" },
  { id: "v2", clientId: "c1", brand: "Fiat", model: "Toro", plate: "RTA-8H90", color: "Branco" },
  {
    id: "v3",
    clientId: "c2",
    brand: "Hyundai",
    model: "HB20",
    plate: "GVB-4D07",
    color: "Vermelho",
  },
  {
    id: "v4",
    clientId: "c3",
    brand: "Renault",
    model: "Kangoo",
    plate: "KLM-1A55",
    color: "Branco",
  },
  {
    id: "v5",
    clientId: "c4",
    brand: "Toyota",
    model: "Corolla",
    plate: "SPX-9J31",
    color: "Preto",
  },
  { id: "v6", clientId: "c5", brand: "Jeep", model: "Renegade", plate: "PNC-5G22", color: "Cinza" },
];

export const orders: ServiceOrder[] = [
  {
    id: "o1",
    code: "OS-1042",
    clientId: "c1",
    vehicleId: "v1",
    serviceId: "s2",
    date: iso(0),
    time: "09:30",
    price: 80,
    status: "AGENDADO",
    notes: "Retirar adesivo do vidro traseiro.",
  },
  {
    id: "o2",
    code: "OS-1043",
    clientId: "c2",
    vehicleId: "v3",
    serviceId: "s1",
    date: iso(0),
    time: "11:00",
    price: 45,
    status: "FINALIZADO",
  },
  {
    id: "o3",
    code: "OS-1044",
    clientId: "c4",
    vehicleId: "v5",
    serviceId: "s3",
    date: iso(0),
    time: "14:00",
    price: 220,
    status: "AGENDADO",
  },
  {
    id: "o4",
    code: "OS-1045",
    clientId: "c5",
    vehicleId: "v6",
    serviceId: "s4",
    date: iso(0),
    time: "16:30",
    price: 160,
    status: "AGENDADO",
  },
  {
    id: "o5",
    code: "OS-1046",
    clientId: "c3",
    vehicleId: "v4",
    serviceId: "s1",
    date: iso(1),
    time: "08:00",
    price: 45,
    status: "AGENDADO",
  },
  {
    id: "o6",
    code: "OS-1047",
    clientId: "c1",
    vehicleId: "v2",
    serviceId: "s5",
    date: iso(1),
    time: "10:30",
    price: 120,
    status: "AGENDADO",
  },
  {
    id: "o7",
    code: "OS-1038",
    clientId: "c1",
    vehicleId: "v1",
    serviceId: "s2",
    date: iso(-6),
    time: "09:00",
    price: 80,
    status: "FINALIZADO",
  },
  {
    id: "o8",
    code: "OS-1039",
    clientId: "c2",
    vehicleId: "v3",
    serviceId: "s5",
    date: iso(-5),
    time: "13:00",
    price: 120,
    status: "FINALIZADO",
  },
  {
    id: "o9",
    code: "OS-1040",
    clientId: "c3",
    vehicleId: "v4",
    serviceId: "s2",
    date: iso(-3),
    time: "15:00",
    price: 80,
    status: "CANCELADO",
  },
  {
    id: "o10",
    code: "OS-1041",
    clientId: "c4",
    vehicleId: "v5",
    serviceId: "s4",
    date: iso(-2),
    time: "10:00",
    price: 160,
    status: "FINALIZADO",
  },
];

export const expenses: Expense[] = [
  {
    id: "e1",
    description: "Shampoo automotivo (20L)",
    category: "Produtos",
    amount: 240,
    date: iso(-4),
  },
  {
    id: "e2",
    description: "Conta de água",
    category: "Água e Energia",
    amount: 380,
    date: iso(-8),
  },
  { id: "e3", description: "Aluguel do box", category: "Aluguel", amount: 1800, date: iso(-10) },
  { id: "e4", description: "Cera de carnaúba", category: "Produtos", amount: 165, date: iso(-1) },
  {
    id: "e5",
    description: "Diária de ajudante",
    category: "Funcionários",
    amount: 120,
    date: iso(0),
  },
];
