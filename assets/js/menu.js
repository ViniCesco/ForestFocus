/* ==========================================================================
   MENU.JS — compartilhado por TODAS as páginas do projeto
   Controla a abertura/fechamento do menu cortina (tela cheia) no mobile.
   ========================================================================== */

function initResponsiveMenu() {
  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.querySelector(".menu-toggle");

  if (!sidebar || !menuButton) return;

  function setMenuState(isOpen) {
    sidebar.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuButton.addEventListener("click", () => {
    setMenuState(!sidebar.classList.contains("active"));
  });

  sidebar.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });
}

document.addEventListener("DOMContentLoaded", initResponsiveMenu);