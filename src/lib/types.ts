export type OrderStatus = "AGENDADO" | "FINALIZADO" | "CANCELADO";
export type PaymentMethod = "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";

export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  notes?: string;
  createdAt: string; // ISO date
}

export interface ServiceType {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

// Item de uma venda; o preço é o do produto na hora da venda.
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  serviceId: string; // "" numa venda (modo VENDAS), que tem itens
  items?: OrderItem[];
  description?: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  price: number;
  notes?: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  paid?: boolean;
}

export type OrderPayment = Pick<ServiceOrder, "paymentMethod" | "paid">;

// Nome de uma categoria cadastrada pela empresa (tela Categorias).
export type ExpenseCategory = string;

export interface Category {
  id: string;
  name: string;
  type: "DESPESA" | "ENTRADA";
  active: boolean;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // yyyy-MM-dd
  notes?: string;
}

// Entrada avulsa: receita que não vem de atendimento. Mesmo formato da despesa.
export type Income = Expense;

export interface Company {
  id: string;
  name: string;
  segment: string;
  ownerName: string;
  email: string;
  plan: string;
  themeColor?: string | null; // #RRGGBB; null = cor padrão
  usageMode?: "SERVICOS" | "VENDAS";
  usesVehicle?: boolean; // ausente = true (lava-rápido, oficina)
  usesDuration?: boolean; // ausente = true
  onboardingDone?: boolean; // false = cai no assistente de primeiro acesso
  appIcon?: string | null; // chave em src/lib/app-icon.ts; nulo = gota
}

export interface OnboardingInput {
  name: string;
  segment: string;
  usageMode: "SERVICOS" | "VENDAS";
  usesVehicle: boolean;
  usesDuration: boolean;
  themeColor: string | null;
  appIcon: string;
  services: Array<{ name: string; price: number; durationMin?: number }>;
  products: Array<{ name: string; price: number; stock: number }>;
}
