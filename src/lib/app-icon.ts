import { useEffect, useState } from "react";
import {
  Briefcase,
  Car,
  Droplets,
  Package,
  Scissors,
  ShoppingBag,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Ícone do app escolhido no primeiro acesso: vira o atalho da tela inicial e o símbolo do login.
// Os PNGs ficam em public/icons/<chave>-{180,192,512}.png, com um manifest por ícone.
export const appIcons: Array<{ key: string; name: string; Icon: LucideIcon }> = [
  { key: "gota", name: "Gota", Icon: Droplets },
  { key: "carro", name: "Carro", Icon: Car },
  { key: "ferramenta", name: "Ferramenta", Icon: Wrench },
  { key: "tesoura", name: "Tesoura", Icon: Scissors },
  { key: "brilho", name: "Brilho", Icon: Sparkles },
  { key: "caixas", name: "Caixas", Icon: Package },
  { key: "sacola", name: "Sacola", Icon: ShoppingBag },
  { key: "maleta", name: "Maleta", Icon: Briefcase },
];
export const DEFAULT_APP_ICON = "gota";
const KEY = "serviceflow.appIcon";

export const appIconOf = (key: string | null | undefined) =>
  appIcons.find((i) => i.key === key) ?? appIcons[0]!;

// Troca o atalho (apple-touch-icon e manifest) e guarda no aparelho para a tela de login.
// O iPhone copia o ícone na hora de "Adicionar à Tela de Início"; trocar depois não altera um atalho já criado.
export function applyAppIcon(key: string | null | undefined) {
  const k = appIconOf(key).key;
  document
    .querySelector('link[rel="apple-touch-icon"]')
    ?.setAttribute("href", `/icons/${k}-180.png`);
  document.querySelector('link[rel="manifest"]')?.setAttribute("href", `/icons/${k}.webmanifest`);
  try {
    localStorage.setItem(KEY, k);
  } catch {
    // armazenamento indisponível: vale até fechar o app
  }
}

// Ícone guardado no aparelho (o login ainda não sabe qual é a empresa).
export function useStoredAppIcon() {
  const [key, setKey] = useState(DEFAULT_APP_ICON);
  useEffect(() => {
    try {
      const k = localStorage.getItem(KEY);
      if (k) {
        setKey(appIconOf(k).key);
        applyAppIcon(k);
      }
    } catch {
      // sem armazenamento: fica a gota
    }
  }, []);
  return appIconOf(key);
}
