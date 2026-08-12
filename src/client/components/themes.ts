// Theme palette shape
export interface Theme {
  id: string;
  name: string;
  bg: string;           // main background
  surface: string;      // cards, inputs
  border: string;       // dividers
  text: string;         // primary text
  textMuted: string;    // secondary text
  textFaint: string;    // timestamps, meta
  accent: string;       // primary buttons, links
  accentHover: string;  // hover state
  danger: string;       // delete, errors
  dangerBg: string;     // error backgrounds
  warning: string;      // edit buttons
  success: string;      // save, copy toast
  codeBg: string;       // code blocks, inline code
  codeText: string;     // code text
  inputBg: string;      // input fields
  inputBorder: string;  // input borders
  btnSecondary: string; // back/close buttons
  btnSecondaryText: string;
}

export const THEMES: Theme[] = [
  // ── Dark (default) ───────────────────────────────────────────
  {
    id: "dark",
    name: "Dark",
    bg: "#0f172a",
    surface: "#1e293b",
    border: "#1e293b",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textFaint: "#475569",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    danger: "#ef4444",
    dangerBg: "#7f1d1d",
    warning: "#f59e0b",
    success: "#22c55e",
    codeBg: "#1e1e2e",
    codeText: "#cdd6f4",
    inputBg: "#1e293b",
    inputBorder: "#334155",
    btnSecondary: "#334155",
    btnSecondaryText: "#e2e8f0",
  },
  // ── Light ────────────────────────────────────────────────────
  {
    id: "light",
    name: "Light",
    bg: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#475569",
    textFaint: "#94a3b8",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    danger: "#dc2626",
    dangerBg: "#fef2f2",
    warning: "#d97706",
    success: "#16a34a",
    codeBg: "#f1f5f9",
    codeText: "#1e293b",
    inputBg: "#ffffff",
    inputBorder: "#cbd5e1",
    btnSecondary: "#e2e8f0",
    btnSecondaryText: "#0f172a",
  },
  // ── Catppuccin Mocha ─────────────────────────────────────────
  {
    id: "catppuccin",
    name: "Catppuccin",
    bg: "#1e1e2e",
    surface: "#313244",
    border: "#45475a",
    text: "#cdd6f4",
    textMuted: "#a6adc8",
    textFaint: "#585b70",
    accent: "#89b4fa",
    accentHover: "#74c7ec",
    danger: "#f38ba8",
    dangerBg: "#45263a",
    warning: "#f9e2af",
    success: "#a6e3a1",
    codeBg: "#181825",
    codeText: "#cdd6f4",
    inputBg: "#313244",
    inputBorder: "#585b70",
    btnSecondary: "#45475a",
    btnSecondaryText: "#cdd6f4",
  },
  // ── Nord ─────────────────────────────────────────────────────
  {
    id: "nord",
    name: "Nord",
    bg: "#2e3440",
    surface: "#3b4252",
    border: "#434c5e",
    text: "#eceff4",
    textMuted: "#d8dee9",
    textFaint: "#4c566a",
    accent: "#88c0d0",
    accentHover: "#81a1c1",
    danger: "#bf616a",
    dangerBg: "#4c3336",
    warning: "#ebcb8b",
    success: "#a3be8c",
    codeBg: "#353b45",
    codeText: "#eceff4",
    inputBg: "#3b4252",
    inputBorder: "#4c566a",
    btnSecondary: "#434c5e",
    btnSecondaryText: "#eceff4",
  },
  // ── Dracula ──────────────────────────────────────────────────
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    surface: "#44475a",
    border: "#6272a4",
    text: "#f8f8f2",
    textMuted: "#bd93f9",
    textFaint: "#6272a4",
    accent: "#ff79c6",
    accentHover: "#ff55aa",
    danger: "#ff5555",
    dangerBg: "#4a2028",
    warning: "#ffb86c",
    success: "#50fa7b",
    codeBg: "#282a36",
    codeText: "#f8f8f2",
    inputBg: "#44475a",
    inputBorder: "#6272a4",
    btnSecondary: "#6272a4",
    btnSecondaryText: "#f8f8f2",
  },
];

export const STORAGE_KEY = "snippet-library-theme";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = THEMES.find((t) => t.id === stored);
      if (found) return found;
    }
  } catch {
    // localStorage unavailable
  }
  return THEMES[0]; // default to Dark
}

export function setStoredTheme(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // localStorage unavailable
  }
}
