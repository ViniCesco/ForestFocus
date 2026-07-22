/* ==========================================================================
   TEMA.JS — compartilhado por TODAS as páginas do projeto
   Aplica o tema salvo em qualquer página (dark/black/light). 
   ========================================================================== */

const THEME_KEY = "forestTheme";
const THEME_SEQUENCE = ["dark", "black", "light"];
const THEME_LABELS = { dark: "Original", black: "Escuro", light: "Claro" };

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function applyTheme(theme) {
  document.body.classList.remove("light-theme", "black-theme");
  if (theme === "light") document.body.classList.add("light-theme");
  if (theme === "black") document.body.classList.add("black-theme");

  const label = document.getElementById("themeToggleLabel");
  if (label) label.textContent = `🎨 Tema: ${THEME_LABELS[theme] || THEME_LABELS.dark}`;
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());

  const toggleBtn = document.getElementById("themeToggleBtn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const currentIndex = THEME_SEQUENCE.indexOf(getSavedTheme());
    const nextTheme = THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
});