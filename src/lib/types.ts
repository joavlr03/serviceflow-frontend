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

export interface ServiceOrder {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  serviceId: string;
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

export type ExpenseCategory =
  | "Produtos"
  | "Água e Energia"
  | "Aluguel"
  | "Funcionários"
  | "Manutenção"
  | "Impostos"
  | "Fornecedores"
  | "Outros";

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // yyyy-MM-dd
  notes?: string;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  ownerName: string;
  email: string;
  plan: string;
  themeColor?: string | null; // #RRGGBB; null = cor padrão
}
