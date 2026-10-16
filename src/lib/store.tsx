import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ensureSession } from "./api-client";
import { applyThemeColor } from "./theme";
import type {
  Client,
  Company,
  Expense,
  OrderPayment,
  OrderStatus,
  ServiceOrder,
  ServiceType,
  Category,
  Vehicle,
} from "./types";

interface StoreValue {
  company: Company;
  clients: Client[];
  vehicles: Vehicle[];
  services: ServiceType[];
  orders: ServiceOrder[];
  expenses: Expense[];
  categories: Category[];
  loading: boolean;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<Client>;
  updateClient: (id: string, c: Omit<Client, "id" | "createdAt">) => Promise<Client>;
  addVehicle: (v: Omit<Vehicle, "id">) => Promise<Vehicle>;
  addOrder: (o: Omit<ServiceOrder, "id" | "code">, idempotencyKey: string) => Promise<ServiceOrder>;
  updateOrder: (id: string, patch: Partial<ServiceOrder>) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus, payment?: OrderPayment) => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  setThemeColor: (color: string) => Promise<void>;
  saveService: (id: string | null, s: Omit<ServiceType, "id">) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveCategory: (id: string | null, c: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clientById: (id: string) => Client | undefined;
  vehicleById: (id: string) => Vehicle | undefined;
  serviceById: (id: string) => ServiceType | undefined;
  vehiclesOfClient: (id: string) => Vehicle[];
  ordersOfClient: (id: string) => ServiceOrder[];
  reload: () => Promise<void>;
}
const emptyCompany: Company = { id: "", name: "", segment: "", ownerName: "", email: "", plan: "" };
const StoreContext = createContext<StoreValue | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState(emptyCompany),
    [clients, setClients] = useState<Client[]>([]),
    [vehicles, setVehicles] = useState<Vehicle[]>([]),
    [services, setServices] = useState<ServiceType[]>([]),
    [orders, setOrders] = useState<ServiceOrder[]>([]),
    [expenses, setExpenses] = useState<Expense[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    if (!(await ensureSession())) return;
    setLoading(true);
    try {
      const [co, cs, ss, os, es, cats] = await Promise.all([
        api.company(),
        api.clients(),
        api.services(),
        api.orders(),
        api.expenses(),
        api.categories(),
      ]);
      const vs = (await Promise.all(cs.map((c) => api.clientVehicles(c.id)))).flat();
      setCompany(co);
      applyThemeColor(co.themeColor);
      setClients(cs);
      setServices(ss);
      setOrders(os);
      setExpenses(es);
      setCategories(cats.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      setVehicles(vs);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    const handler = () => void reload();
    window.addEventListener("serviceflow-auth", handler);
    return () => window.removeEventListener("serviceflow-auth", handler);
  }, [reload]);
  const addClient = useCallback(async (x: Omit<Client, "id" | "createdAt">) => {
    const c = await api.createClient(x);
    setClients((p) => [c, ...p]);
    return c;
  }, []);
  const updateClient = useCallback(async (id: string, x: Omit<Client, "id" | "createdAt">) => {
    const c = await api.updateClient(id, x);
    setClients((p) => p.map((client) => (client.id === id ? c : client)));
    return c;
  }, []);
  const addVehicle = useCallback(async (x: Omit<Vehicle, "id">) => {
    const v = await api.createVehicle(x);
    setVehicles((p) => [v, ...p]);
    return v;
  }, []);
  const addOrder = useCallback(async (x: Omit<ServiceOrder, "id" | "code">, key: string) => {
    const o = await api.createOrder(x, key);
    setOrders((p) => [o, ...p]);
    return o;
  }, []);
  const setOrderStatus = useCallback(
    async (id: string, status: OrderStatus, payment?: OrderPayment) => {
      const o = await api.setOrderStatus(id, status, payment);
      setOrders((p) => p.map((x) => (x.id === id ? o : x)));
    },
    [],
  );
  const updateOrder = useCallback(
    async (id: string, patch: Partial<ServiceOrder>) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const { id: _id, code: _code, status: _status, ...body } = { ...current, ...patch };
      const o = await api.updateOrder(id, body);
      setOrders((p) => p.map((x) => (x.id === id ? o : x)));
    },
    [orders],
  );
  const addExpense = useCallback(async (x: Omit<Expense, "id">) => {
    const e = await api.createExpense(x);
    setExpenses((p) => [e, ...p]);
  }, []);
  const setThemeColor = useCallback(async (color: string) => {
    const co = await api.updateThemeColor(color);
    setCompany(co);
    applyThemeColor(co.themeColor);
  }, []);
  const saveService = useCallback(async (id: string | null, x: Omit<ServiceType, "id">) => {
    const s = await api.saveService(id, x);
    setServices((p) =>
      [...p.filter((y) => y.id !== s.id), s].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }, []);
  const deleteService = useCallback(async (id: string) => {
    await api.deleteService(id);
    setServices((p) => p.filter((s) => s.id !== id));
  }, []);
  const saveCategory = useCallback(
    async (id: string | null, x: Omit<Category, "id">) => {
      const old = categories.find((y) => y.id === id)?.name;
      const c = await api.saveCategory(id, x);
      setCategories((p) =>
        [...p.filter((y) => y.id !== c.id), c].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
      // A API renomeia as despesas antigas junto; espelha aqui sem recarregar tudo.
      if (old && old !== c.name)
        setExpenses((p) => p.map((e) => (e.category === old ? { ...e, category: c.name } : e)));
    },
    [categories],
  );
  const deleteCategory = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    setCategories((p) => p.filter((c) => c.id !== id));
  }, []);
  const value = useMemo<StoreValue>(
    () => ({
      company,
      clients,
      vehicles,
      services,
      orders,
      expenses,
      categories,
      loading,
      addClient,
      updateClient,
      addVehicle,
      addOrder,
      updateOrder,
      setOrderStatus,
      addExpense,
      setThemeColor,
      saveService,
      deleteService,
      saveCategory,
      deleteCategory,
      clientById: (id) => clients.find((x) => x.id === id),
      vehicleById: (id) => vehicles.find((x) => x.id === id),
      serviceById: (id) => services.find((x) => x.id === id),
      vehiclesOfClient: (id) => vehicles.filter((x) => x.clientId === id),
      ordersOfClient: (id) =>
        orders
          .filter((x) => x.clientId === id)
          .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)),
      reload,
    }),
    [
      company,
      clients,
      vehicles,
      services,
      orders,
      expenses,
      categories,
      loading,
      addClient,
      updateClient,
      addVehicle,
      addOrder,
      updateOrder,
      setOrderStatus,
      addExpense,
      setThemeColor,
      saveService,
      deleteService,
      saveCategory,
      deleteCategory,
      reload,
    ],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}
