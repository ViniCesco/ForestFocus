/* ==========================================================================
   MENU.JS — compartilhado por TODAS as páginas do projeto
   Controla a abertura/fechamento do menu cortina (tela cheia) no mobile.
   Deve ser incluído em toda página ANTES do JS específico da página
   (ex: dashboard.js, tarefas.js, pomodoro.js).
   ========================================================================== */

function initResponsiveMenu() {
  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.querySelector(".menu-toggle");

  if (!sidebar || !menuButton) return;

  // Além de abrir/fechar a sidebar, marca o <body> com "menu-open".
  // Isso permite que qualquer página esconda elementos flutuantes
  // (ex: o balão de música do Pomodoro) enquanto o menu está aberto,
  // sem precisar duplicar lógica em cada página.
  function setMenuState(isOpen) {
    sidebar.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuButton.addEventListener("click", () => {
    setMenuState(!sidebar.classList.contains("active"));
  });

  // Fecha o menu ao clicar em qualquer link dentro dele (navegação)
  sidebar.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });
}

document.addEventListener("DOMContentLoaded", initResponsiveMenu);