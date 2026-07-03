/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/

console.log("Sistema de Perfil Carregado!");

/* ----------------------------------------------
   2. RENDERIZAÇÃO E LÓGICA DE INTERFACE
-----------------------------------------------*/

/* Recupera os dados do localStorage e renderiza as informações, patentes e cores com base no XP */
function renderProfile() {
  const currentName = localStorage.getItem("forestUsername") || "Explorador do Foco";
  const currentXP = parseInt(localStorage.getItem("forestXP") || "0", 10);
  const currentTrees = localStorage.getItem("forestTrees") || "0";
  const currentAvatar = localStorage.getItem("forestAvatar") || "🌱";
  
  const nameDisplay = document.getElementById("profileNameDisplay");
  const xpDisplay = document.getElementById("profileXP");
  const treesDisplay = document.getElementById("profileTrees");
  const titleDisplay = document.getElementById("profileTitleDisplay");
  const avatarDisplay = document.getElementById("profileAvatarDisplay");

  if (nameDisplay) nameDisplay.textContent = currentName;
  if (xpDisplay) xpDisplay.textContent = `${currentXP} XP`;
  if (treesDisplay) treesDisplay.textContent = currentTrees;
  if (avatarDisplay) avatarDisplay.textContent = currentAvatar;

  if (titleDisplay) {
    if (currentXP >= 900) {
      titleDisplay.textContent = "Nível 10 – Ancestral da Natureza 🌌 (Nível Máximo Alcançado!)";
      titleDisplay.style.color = "#ef4444";
    } else if (currentXP >= 800) {
      titleDisplay.textContent = "Nível 9 – Espírito da Flora 🦊";
      titleDisplay.style.color = "#a855f7";
    } else if (currentXP >= 700) {
      titleDisplay.textContent = "Nível 8 – Sentinela da Floresta 🌲";
      titleDisplay.style.color = "#c084fc";
    } else if (currentXP >= 600) {
      titleDisplay.textContent = "Nível 7 – Guardião da Clareira 🛡️";
      titleDisplay.style.color = "#e9d5ff";
    } else if (currentXP >= 500) {
      titleDisplay.textContent = "Nível 6 – Fazendeiro Resiliente 🚜";
      titleDisplay.style.color = "#3b82f6";
    } else if (currentXP >= 400) {
      titleDisplay.textContent = "Nível 5 – Protetor das Raízes 🌳";
      titleDisplay.style.color = "#60a5fa";
    } else if (currentXP >= 300) {
      titleDisplay.textContent = "Nível 4 – Jardineiro do Bosque 🪵";
      titleDisplay.style.color = "#93c5fd";
    } else if (currentXP >= 200) {
      titleDisplay.textContent = "Nível 3 – Cuidador de Brotos 🪴";
      titleDisplay.style.color = "#f59e0b";
    } else if (currentXP >= 100) {
      titleDisplay.textContent = "Nível 2 – Escoteiro da Mata 🎒";
      titleDisplay.style.color = "#34d399";
    } else {
      titleDisplay.textContent = "Nível 1 – Semeador Aprendiz 🌱";
      titleDisplay.style.color = "#10b981";
    }
  }
}

/* ----------------------------------------------
   3. ATUALIZAÇÃO DE DADOS (AÇÕES)
-----------------------------------------------*/

/* Valida o campo de texto e atualiza o nome de usuário salvo localmente */
function updateUsername() {
  const input = document.getElementById("usernameInput");
  if (!input) return;

  const newName = input.value.trim();
  if (newName === "") {
    alert("Por favor, digite um nome válido.");
    return;
  }

  localStorage.setItem("forestUsername", newName);
  input.value = "";
  renderProfile();
}

/* ----------------------------------------------
   4. GERENCIAMENTO DE AVATAR (MODAL)
-----------------------------------------------*/

/* Alterna a visibilidade do modal de seleção de avatares na tela */
function openAvatarModal() {
  const modal = document.getElementById("avatarModal");
  if (modal) {
    modal.style.display = modal.style.display === "none" ? "block" : "none";
  }
}

/* Salva o emoji selecionado como o novo avatar do perfil e fecha a janela modal */
function selectAvatar(avatarEmoji) {
  localStorage.setItem("forestAvatar", avatarEmoji);
  
  const modal = document.getElementById("avatarModal");
  if (modal) modal.style.display = "none";
  
  renderProfile(); 
}

/* ----------------------------------------------
   5. GATILHO DE EXECUÇÃO (DOM)
-----------------------------------------------*/

/* Dispara a renderização inicial do perfil assim que o arquivo HTML é totalmente estruturado */
document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
});

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");
    const button = document.querySelector(".menu-toggle");
    const main = document.querySelector(".main-content");

    if (!sidebar || !button || !main) return;

    button.addEventListener("click", () => {

        sidebar.classList.toggle("open");
        main.classList.toggle("menu-expanded");

    });

});

