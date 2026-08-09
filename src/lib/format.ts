export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const parseISO = (d: string) => {
  const parts = d.split("-").map(Number);
  return new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1);
};

export const formatDate = (d: string) =>
  parseISO(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const formatLongDate = (d: string) =>
  parseISO(d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

export const startOfWeekISO = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

export const startOfMonthISO = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};
