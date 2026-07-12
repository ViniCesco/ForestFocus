/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/

console.log("Sistema de Metas Carregado!");

let goals = [];
let currentFilter = "Todas";

/* ----------------------------------------------
   2. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
-----------------------------------------------*/

/* Carrega as metas salvas localmente no armazenamento do navegador */
function loadGoals() {
  const savedGoals = localStorage.getItem("forestGoals");
  if (savedGoals) {
    goals = JSON.parse(savedGoals);
  }
}

/* Salva a lista atual de metas no armazenamento local do navegador */
function saveGoals() {
  localStorage.setItem("forestGoals", JSON.stringify(goals));
}

/* ----------------------------------------------
   3. OPERAÇÕES PRINCIPAIS (AÇÕES)
-----------------------------------------------*/

/* Valida os dados do formulário e cria uma nova meta com progresso zerado */
function addGoal() {
  const category = document.getElementById("goalCategory").value;
  const title = document.getElementById("goalInput").value.trim();
  const target = Number(document.getElementById("goalTarget").value);

  if (!category) {
    alert("Por favor, selecione uma categoria para a sua meta.");
    return;
  }
  if (title === "" || target <= 0) {
    alert("Insira uma descrição válida e um valor alvo maior que zero.");
    return;
  }

  goals.push({
    id: Date.now(),
    category: category,
    title: title,
    current: 0,
    target: target
  });

  saveGoals();
  renderGoals();

  document.getElementById("goalCategory").selectedIndex = 0;
  document.getElementById("goalInput").value = "";
  document.getElementById("goalTarget").value = "";
}

function incrementGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  const valueToAdd = Number(prompt(`Meta: ${goal.title}\nQuanto você deseja ADICIONAR ao progresso atual?`));

  if (isNaN(valueToAdd) || valueToAdd <= 0) {
    alert("Por favor, digite um número válido maior que zero.");
    return;
  }

  goal.current = Math.min(goal.current + valueToAdd, goal.target);
  
  saveGoals();
  renderGoals();
}

function decrementGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  const valueToSubtract = Number(prompt(`Meta: ${goal.title}\nQuanto você deseja SUBTRAIR do progresso atual?`));

  if (isNaN(valueToSubtract) || valueToSubtract <= 0) {
    alert("Por favor, digite um número válido maior que zero.");
    return;
  }

  goal.current = Math.max(goal.current - valueToSubtract, 0);

  saveGoals();
  renderGoals();
}

/* Altera o texto descritivo/objetivo de uma meta cadastrada */
function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  const newTitle = prompt("Edite o seu objetivo:", goal.title);

  if (newTitle && newTitle.trim() !== "") {
    goal.title = newTitle.trim();
    saveGoals();
    renderGoals();
  }
}

/* Remove definitivamente uma meta do sistema após a confirmação do usuário */
function deleteGoal(id) {
  if (confirm("Tem certeza que deseja excluir esta meta?")) {
    goals = goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
  }
}

/* ----------------------------------------------
   4. FILTROS E RENDERIZAÇÃO DE INTERFACE
-----------------------------------------------*/

/* Renderiza as metas na tela, calculando porcentagens e aplicando o filtro de categoria selecionado */
function renderGoals() {
  const listElement = document.getElementById("goalList");
  if (!listElement) return;

  listElement.innerHTML = "";

  let profCount = goals.filter(g => g.category === "Profissional").length;
  let persCount = goals.filter(g => g.category === "Pessoal").length;
  let finCount = goals.filter(g => g.category === "Financeira").length;

  const filteredGoals = goals.filter(goal => {
    if (currentFilter === "Todas") return true;
    return goal.category === currentFilter;
  });

  if (filteredGoals.length === 0) {
    listElement.innerHTML = `<p style="color: var(--text-label); font-style: italic;">Nenhuma meta nesta categoria.</p__>`;
  }

  filteredGoals.forEach(goal => {
    const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    const isCompleted = percent === 100;

    const li = document.createElement("li");
    li.style.cssText = "background: #1e1e2f; padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;";

    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div>
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #a78bfa; font-weight: bold;">
            ${goal.category === "Profissional" ? "🎓 Profissional" : goal.category === "Pessoal" ? "🏠 Pessoal" : "💰 Financeira"}
          </span>
          <strong style="display: block; font-size: 16px; color: #fff; margin-top: 3px; ${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
            ${goal.title}
          </strong>
          <span style="display: block; font-size: 13px; color: #a0aec0; margin-top: 2px;">
            Progresso: ${goal.current.toLocaleString('pt-BR')} / ${goal.target.toLocaleString('pt-BR')} (${percent}%)
          </span>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button onclick="decrementGoal(${goal.id})" style="background: #3d3d5c; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">-</button>
          <button onclick="incrementGoal(${goal.id})" style="background: #6366f1; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">+</button>
          <button onclick="editGoal(${goal.id})" title="Editar objetivo" style="background: transparent; border: none; cursor: pointer; font-size: 15px; margin-left: 5px;">✏️</button>
          <button onclick="deleteGoal(${goal.id})" style="background: transparent; border: none; cursor: pointer; font-size: 16px; margin-left: 5px;">❌</button>
        </div>
      </div>

      <div class="progress-bar" style="width: 100%; height: 6px; background: #2d2d44; border-radius: 3px; overflow: hidden;">
        <div style="width: ${percent}%; height: 100%; background: ${isCompleted ? '#10b981' : '#6366f1'}; transition: width 0.3s ease;"></div>
      </div>
    `;

    listElement.appendChild(li);
  });

  document.getElementById("professionalGoalsCounter").textContent = profCount;
  document.getElementById("personalGoalsCounter").textContent = persCount;
  document.getElementById("financialGoalsCounter").textContent = finCount;
}

function filterGoals(category) {
  currentFilter = category;

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    if (btn.innerText.includes(category) || (category === "Todas" && btn.innerText === "Todas")) {
      btn.style.background = "#6366f1";
      btn.style.color = "#fff";
      btn.style.border = "none";
    } else {
      btn.style.background = "#1e1e2f";
      btn.style.color = "#a0aec0";
      btn.style.border = "1px solid #3d3d5c";
    }
  });

  renderGoals();
}

/* ----------------------------------------------
   5. ACESSIBILIDADE E ATALHOS
-----------------------------------------------*/

/* Escuta os campos de entrada de dados e dispara a gravação da meta ao pressionar a tecla Enter */
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
-----------------------------------------------*/

/* Executa o carregamento das metas, monta os atalhos de teclado e atualiza a interface visual */
loadGoals();
renderGoals();
setupEnterKey();

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