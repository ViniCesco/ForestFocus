/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/

console.log("Sistema de Metas Carregado!");

let goals = [];
let currentFilter = "Todas";

let pendingGoalId = null;
let pendingGoalAction = null;
let editingGoalId = null;
let pendingDeleteId = null;

/* ----------------------------------------------
   2. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
-----------------------------------------------*/

function loadGoals() {
  const savedGoals = localStorage.getItem("forestGoals");
  if (savedGoals) {
    goals = JSON.parse(savedGoals);
  }
}

function saveGoals() {
  localStorage.setItem("forestGoals", JSON.stringify(goals));
}

/* ----------------------------------------------
   3. OPERAÇÕES PRINCIPAIS (AÇÕES)
-----------------------------------------------*/

function addGoal() {
  const categoryEl = document.getElementById("goalCategory");
  const titleEl = document.getElementById("goalInput");
  const targetEl = document.getElementById("goalTarget");
  const error = document.getElementById("goalFormError");

  const category = categoryEl.value;
  const title = titleEl.value.trim();
  const target = Number(targetEl.value);

  if (!category) {
    if (error) error.textContent = "Selecione uma categoria para a sua meta.";
    return;
  }
  if (title === "" || target <= 0) {
    if (error) error.textContent = "Insira uma descrição válida e um alvo maior que zero.";
    return;
  }
  if (error) error.textContent = "";

  goals.push({
    id: Date.now(),
    category: category,
    title: title,
    current: 0,
    target: target
  });

  saveGoals();
  renderGoals();

  categoryEl.selectedIndex = 0;
  titleEl.value = "";
  targetEl.value = "";
}

/* Abre o modal de valor, usado tanto por incrementGoal quanto decrementGoal */
function openAmountModal(id, action) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  pendingGoalId = id;
  pendingGoalAction = action;

  const modal = document.getElementById("goalAmountModal");
  const title = document.getElementById("goalAmountTitle");
  const input = document.getElementById("goalAmountInput");
  const error = document.getElementById("goalAmountError");
  if (!modal || !input) return;

  if (title) {
    title.textContent = action === "increment"
      ? `Adicionar progresso — ${goal.title}`
      : `Subtrair progresso — ${goal.title}`;
  }
  input.value = "";
  if (error) error.textContent = "";
  modal.classList.add("active");
  input.focus();
}

function closeAmountModal() {
  document.getElementById("goalAmountModal")?.classList.remove("active");
  pendingGoalId = null;
  pendingGoalAction = null;
}

function confirmAmount() {
  const input = document.getElementById("goalAmountInput");
  const error = document.getElementById("goalAmountError");
  if (!input || pendingGoalId === null) return;

  const value = Number(input.value);
  if (isNaN(value) || value <= 0) {
    if (error) error.textContent = "Digite um número válido maior que zero.";
    return;
  }

  const goal = goals.find(g => g.id === pendingGoalId);
  if (!goal) return;

  if (pendingGoalAction === "increment") {
    goal.current = Math.min(goal.current + value, goal.target);
  } else {
    goal.current = Math.max(goal.current - value, 0);
  }

  saveGoals();
  renderGoals();
  closeAmountModal();
}

function incrementGoal(id) {
  openAmountModal(id, "increment");
}

function decrementGoal(id) {
  openAmountModal(id, "decrement");
}

function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  editingGoalId = id;

  const modal = document.getElementById("goalEditModal");
  const input = document.getElementById("goalEditInput");
  const error = document.getElementById("goalEditError");
  if (!modal || !input) return;

  input.value = goal.title;
  if (error) error.textContent = "";
  modal.classList.add("active");
  input.focus();
}

function closeGoalEditModal() {
  document.getElementById("goalEditModal")?.classList.remove("active");
  editingGoalId = null;
}

function saveGoalEdit() {
  const input = document.getElementById("goalEditInput");
  const error = document.getElementById("goalEditError");
  if (!input || editingGoalId === null) return;

  const newTitle = input.value.trim();
  if (newTitle === "") {
    if (error) error.textContent = "O objetivo não pode ficar vazio.";
    return;
  }

  const goal = goals.find(g => g.id === editingGoalId);
  if (goal) {
    goal.title = newTitle;
    saveGoals();
    renderGoals();
  }
  closeGoalEditModal();
}

function deleteGoal(id) {
  pendingDeleteId = id;
  document.getElementById("goalDeleteModal")?.classList.add("active");
}

function closeDeleteModal() {
  document.getElementById("goalDeleteModal")?.classList.remove("active");
  pendingDeleteId = null;
}

function confirmDeleteGoal() {
  if (pendingDeleteId === null) return;
  goals = goals.filter(g => g.id !== pendingDeleteId);
  saveGoals();
  renderGoals();
  closeDeleteModal();
}

/* ----------------------------------------------
   4. FILTROS E RENDERIZAÇÃO DE INTERFACE
-----------------------------------------------*/

const categoryLabels = {
  Profissional: "🎓 Profissional",
  Pessoal: "🏠 Pessoal",
  Financeira: "💰 Financeira"
};

function renderGoals() {
  const listElement = document.getElementById("goalList");
  if (!listElement) return;

  listElement.innerHTML = "";

  const profCount = goals.filter(g => g.category === "Profissional").length;
  const persCount = goals.filter(g => g.category === "Pessoal").length;
  const finCount = goals.filter(g => g.category === "Financeira").length;

  const filteredGoals = goals.filter(goal => {
    if (currentFilter === "Todas") return true;
    return goal.category === currentFilter;
  });

  if (filteredGoals.length === 0) {
    listElement.innerHTML = `<p class="meta-empty">Nenhuma meta nesta categoria.</p>`;
  } else {
    filteredGoals.forEach(goal => {
      const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
      const isCompleted = percent === 100;

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="goal-top-row">
          <div class="goal-content-wrapper">
            <span class="goal-tag">${categoryLabels[goal.category] || goal.category}</span>
            <span class="goal-title ${isCompleted ? "completed" : ""}">${goal.title}</span>
            <span class="goal-target-val">
              Progresso: ${goal.current.toLocaleString("pt-BR")} / ${goal.target.toLocaleString("pt-BR")} (${percent}%)
            </span>
          </div>
          <div class="goal-actions">
            <button class="goal-btn-decrement" onclick="decrementGoal(${goal.id})">-</button>
            <button class="goal-btn-increment" onclick="incrementGoal(${goal.id})">+</button>
            <button onclick="editGoal(${goal.id})" title="Editar objetivo">✏️</button>
            <button onclick="deleteGoal(${goal.id})" title="Excluir">❌</button>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${isCompleted ? "completed" : ""}" style="width: ${percent}%"></div>
        </div>
      `;

      listElement.appendChild(li);
    });
  }

  document.getElementById("professionalGoalsCounter").textContent = profCount;
  document.getElementById("personalGoalsCounter").textContent = persCount;
  document.getElementById("financialGoalsCounter").textContent = finCount;
}

function filterGoals(category) {
  currentFilter = category;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });

  renderGoals();
}

/* ----------------------------------------------
   5. ACESSIBILIDADE E ATALHOS
-----------------------------------------------*/

function setupEnterKey() {
  const inputs = ["goalInput", "goalTarget"];

  inputs.forEach(id => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
      inputElement.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addGoal();
        }
      });
    }
  });
}

/* ----------------------------------------------
   6. DISPARO INICIAL
   (menu mobile agora é responsabilidade do menu.js, incluído no HTML
    antes deste arquivo)
-----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  loadGoals();
  renderGoals();
  setupEnterKey();

  document.getElementById("goalAmountCancelBtn")?.addEventListener("click", closeAmountModal);
  document.getElementById("goalAmountConfirmBtn")?.addEventListener("click", confirmAmount);
  document.getElementById("goalAmountModal")?.addEventListener("click", (e) => {
    if (e.target.id === "goalAmountModal") closeAmountModal();
  });
  document.getElementById("goalAmountInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmAmount();
  });

  document.getElementById("goalEditCancelBtn")?.addEventListener("click", closeGoalEditModal);
  document.getElementById("goalEditSaveBtn")?.addEventListener("click", saveGoalEdit);
  document.getElementById("goalEditModal")?.addEventListener("click", (e) => {
    if (e.target.id === "goalEditModal") closeGoalEditModal();
  });
  document.getElementById("goalEditInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveGoalEdit();
  });

  document.getElementById("goalDeleteCancelBtn")?.addEventListener("click", closeDeleteModal);
  document.getElementById("goalDeleteConfirmBtn")?.addEventListener("click", confirmDeleteGoal);
  document.getElementById("goalDeleteModal")?.addEventListener("click", (e) => {
    if (e.target.id === "goalDeleteModal") closeDeleteModal();
  });
});