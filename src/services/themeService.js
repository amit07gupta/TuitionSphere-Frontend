export const THEME_KEY = "tuitionsphere_admin_theme";

export function getThemeMode() {
  const saved = localStorage.getItem(THEME_KEY);
  return ["light", "dark", "system"].includes(saved) ? saved : "system";
}

export function resolveTheme(mode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(mode) {
  const safeMode = ["light", "dark", "system"].includes(mode) ? mode : "system";
  localStorage.setItem(THEME_KEY, safeMode);
  document.documentElement.dataset.adminThemeMode = safeMode;
  document.documentElement.dataset.adminTheme = resolveTheme(safeMode);
  window.dispatchEvent(new CustomEvent("admin-theme-change", { detail: safeMode }));
}
