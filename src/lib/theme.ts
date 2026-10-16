// Cor de destaque da empresa (variável CSS --secondary). Fica guardada no aparelho
// para o app já abrir com ela, sem piscar a cor padrão.
const KEY = "serviceflow.themeColor";
const HEX = /^#[0-9A-Fa-f]{6}$/;

// Paleta curada: todas com contraste >= 4,5:1 com texto branco (WCAG AA).
export const themePalette = [
  { name: "Vermelho (padrão)", color: "#E02506" },
  { name: "Laranja", color: "#C2410C" },
  { name: "Rosa", color: "#BE185D" },
  { name: "Roxo", color: "#7C3AED" },
  { name: "Azul", color: "#2563EB" },
  { name: "Verde-azulado", color: "#0F766E" },
  { name: "Verde", color: "#15803D" },
  { name: "Grafite", color: "#374151" },
];
export const DEFAULT_THEME_COLOR = "#E02506";

// Só troca a cor na tela (prévia), sem guardar.
export function previewThemeColor(color: string | null | undefined) {
  const style = document.documentElement.style;
  if (color && HEX.test(color)) style.setProperty("--secondary", color);
  else style.removeProperty("--secondary");
}

export function applyThemeColor(color: string | null | undefined) {
  const valid = color && HEX.test(color) ? color : null;
  previewThemeColor(valid);
  try {
    if (valid) localStorage.setItem(KEY, valid);
    else localStorage.removeItem(KEY);
  } catch {
    // armazenamento indisponível: a cor ainda vale até fechar o app
  }
}

// Roda no <head>, antes da primeira pintura da tela.
export const themeBootScript = `try{var c=localStorage.getItem("${KEY}");if(c&&${HEX}.test(c))document.documentElement.style.setProperty("--secondary",c)}catch(e){}`;
