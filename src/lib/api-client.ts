import type {
  Client,
  Company,
  Expense,
  OrderPayment,
  OrderStatus,
  ServiceOrder,
  ServiceType,
  Vehicle,
} from "./types";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:9000/api/v2";
let accessToken: string | null = null;
const storage = () => (typeof window === "undefined" ? null : window.sessionStorage);
let refreshInFlight: Promise<boolean> | null = null;
type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    companyId: number;
    name: string;
    email: string;
    role: string;
    passwordChangeRequired: boolean;
  };
};
type ApiClient = Omit<Client, "id"> & { id: number };
type ApiVehicle = Omit<Vehicle, "id" | "clientId"> & { id: number; clientId: number };
type ApiService = Omit<ServiceType, "id"> & { id: number };
type ApiOrder = Omit<ServiceOrder, "id" | "clientId" | "vehicleId" | "serviceId"> & {
  id: number;
  clientId: number;
  vehicleId: number;
  serviceId: number;
};
type ApiExpense = Omit<Expense, "id"> & { id: number };
type ApiCompany = Omit<Company, "id"> & { id: number };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function performRefresh() {
  const refreshToken = storage()?.getItem("serviceflow.refreshToken");
  if (!refreshToken) return false;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    clearSession();
    return false;
  }
  const data = await response.json();
  accessToken = data.accessToken;
  storage()?.setItem("serviceflow.refreshToken", data.refreshToken);
  return true;
}

async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
  authenticated = true,
): Promise<T> {
  if (authenticated && !accessToken && retry) await refreshSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
  if (authenticated && response.status === 401 && retry && (await refreshSession()))
    return request<T>(path, init, false, true);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.code ?? "API_ERROR",
      error.message ?? "Falha na comunicação com a API",
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await request<LoginResult>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false,
    false,
  );
  accessToken = response.accessToken;
  storage()?.setItem("serviceflow.refreshToken", response.refreshToken);
  return response.user;
}
export async function getSetupStatus() {
  return request<{ available: boolean }>("/setup/status", {}, false, false);
}
export async function setupOwner(input: {
  companyName: string;
  segment: string;
  ownerName: string;
  email: string;
  password: string;
  inviteKey: string;
}) {
  return request<{ companyId: number; userId: number }>(
    "/setup",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
    false,
  );
}
export async function logout() {
  const refreshToken = storage()?.getItem("serviceflow.refreshToken");
  if (refreshToken)
    await request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }).catch(
      () => undefined,
    );
  clearSession();
}
export async function forgotPassword(email: string) {
  return request<{ message: string }>(
    "/auth/esqueci-minha-senha",
    { method: "POST", body: JSON.stringify({ email }) },
    false,
    false,
  );
}
export async function changePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>("/auth/alterar-senha", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
export function clearSession() {
  accessToken = null;
  storage()?.removeItem("serviceflow.refreshToken");
}
export async function ensureSession() {
  if (accessToken) return true;
  return refreshSession();
}

const client = (x: ApiClient): Client => ({
  ...x,
  id: String(x.id),
  createdAt: String(x.createdAt).slice(0, 10),
});
const vehicle = (x: ApiVehicle): Vehicle => ({
  ...x,
  id: String(x.id),
  clientId: String(x.clientId),
});
const service = (x: ApiService): ServiceType => ({ ...x, id: String(x.id) });
const order = (x: ApiOrder): ServiceOrder => ({
  ...x,
  id: String(x.id),
  // API ainda gera "OS-1042"; nas telas o termo é "Atendimento"
  code: String(x.code).replace(/^OS-/, "AT-"),
  clientId: String(x.clientId),
  vehicleId: String(x.vehicleId),
  serviceId: String(x.serviceId),
  time: String(x.time).slice(0, 5),
});
const expense = (x: ApiExpense): Expense => ({ ...x, id: String(x.id) });

function operationalPeriod() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 366);
  return new URLSearchParams({
    dataInicial: start.toISOString().slice(0, 10),
    dataFinal: end.toISOString().slice(0, 10),
  }).toString();
}
export const api = {
  company: async () => {
    const x = await request<ApiCompany>("/empresa");
    return { ...x, id: String(x.id) } as Company;
  },
  updateThemeColor: async (color: string) => {
    const x = await request<ApiCompany>("/empresa/tema", {
      method: "PUT",
      body: JSON.stringify({ color }),
    });
    return { ...x, id: String(x.id) } as Company;
  },
  clients: async () => (await request<ApiClient[]>("/clientes")).map(client),
  createClient: async (x: Omit<Client, "id" | "createdAt">) =>
    client(await request<ApiClient>("/clientes", { method: "POST", body: JSON.stringify(x) })),
  updateClient: async (id: string, x: Omit<Client, "id" | "createdAt">) =>
    client(await request<ApiClient>(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(x) })),
  clientVehicles: async (id: string) =>
    (await request<ApiVehicle[]>(`/clientes/${id}/veiculos`)).map(vehicle),
  createVehicle: async (x: Omit<Vehicle, "id">) =>
    vehicle(
      await request<ApiVehicle>("/veiculos", {
        method: "POST",
        body: JSON.stringify({ ...x, clientId: Number(x.clientId) }),
      }),
    ),
  services: async () => (await request<ApiService[]>("/servicos")).map(service),
  saveService: async (id: string | null, x: Omit<ServiceType, "id">) =>
    service(
      await request<ApiService>(id ? `/servicos/${id}` : "/servicos", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(x),
      }),
    ),
  deleteService: (id: string) => request<void>(`/servicos/${id}`, { method: "DELETE" }),
  orders: async () =>
    (await request<ApiOrder[]>(`/ordens-servico?${operationalPeriod()}`)).map(order),
  createOrder: async (x: Omit<ServiceOrder, "id" | "code">, idempotencyKey: string) => {
    const { status: _status, ...body } = x;
    return order(
      await request<ApiOrder>("/ordens-servico", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          ...body,
          clientId: Number(body.clientId),
          vehicleId: Number(body.vehicleId),
          serviceId: Number(body.serviceId),
        }),
      }),
    );
  },
  updateOrder: async (id: string, x: Omit<ServiceOrder, "id" | "code" | "status">) =>
    order(
      await request<ApiOrder>(`/ordens-servico/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...x,
          clientId: Number(x.clientId),
          vehicleId: Number(x.vehicleId),
          serviceId: Number(x.serviceId),
        }),
      }),
    ),
  setOrderStatus: async (id: string, status: OrderStatus, payment?: OrderPayment) =>
    order(
      await request<ApiOrder>(`/ordens-servico/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...payment }),
      }),
    ),
  expenses: async () =>
    (await request<ApiExpense[]>(`/despesas?${operationalPeriod()}`)).map(expense),
  createExpense: async (x: Omit<Expense, "id">) =>
    expense(await request<ApiExpense>("/despesas", { method: "POST", body: JSON.stringify(x) })),
};
