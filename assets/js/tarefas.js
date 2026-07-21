/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/

console.log("Gerenciador de Tarefas Carregado!");

let tasks = [];
let forestTrees = Number(localStorage.getItem("forestTrees")) || 0;
let forestXP = Number(localStorage.getItem("forestXP")) || 0;
let dayRewardClaimed = JSON.parse(localStorage.getItem("dayRewardClaimed")) || false;

/* ----------------------------------------------
   2. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
-----------------------------------------------*/

/* Carrega a lista de tarefas salva localmente no armazenamento do navegador */
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

/* Salva o estado atual do array de tarefas no armazenamento local do navegador */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ----------------------------------------------
   3. OPERAÇÕES PRINCIPAIS (AÇÕES)
-----------------------------------------------*/
function addTask() {
  const input = document.getElementById("taskInput");
  if (!input) return;

  const text = input.value.trim();
  const selectCategory = document.getElementById("taskCategory");
  const selectPriority = document.getElementById("taskPriority");

  if (text === "") {
    alert("Por favor, digite o nome da tarefa.");
    return;
  }
  if (!selectCategory || selectCategory.value === "") {
    alert("Por favor, selecione uma categoria.");
    return;
  }
  if (!selectPriority || selectPriority.value === "") {
    alert("Por favor, selecione uma prioridade.");
    return;
  }

  const category = selectCategory.options[selectCategory.selectedIndex].text;
  const priority = selectPriority.value;

  tasks.push({
    text,
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });

  input.value = "";
  selectCategory.selectedIndex = 0;
  selectPriority.selectedIndex = 0;

  saveTasks();
  renderTasks();
  updateTaskStats();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  updateTaskStats();
}

let editingTaskIndex = null;

function editTask(index) {
  editingTaskIndex = index;

  const modal = document.getElementById("editTaskModal");
  const input = document.getElementById("editTaskInput");
  const error = document.getElementById("editTaskError");
  if (!modal || !input) return;

  input.value = tasks[index].text;
  if (error) error.textContent = "";
  modal.classList.add("active");
  input.focus();
}

function closeEditTaskModal() {
  const modal = document.getElementById("editTaskModal");
  if (modal) modal.classList.remove("active");
  editingTaskIndex = null;
}

function saveEditTask() {
  const input = document.getElementById("editTaskInput");
  const error = document.getElementById("editTaskError");
  if (!input || editingTaskIndex === null) return;

  const newText = input.value.trim();
  if (newText === "") {
    if (error) error.textContent = "A tarefa não pode ficar vazia.";
    return;
  }

  tasks[editingTaskIndex].text = newText;

  saveTasks();
  renderTasks();
  updateTaskStats();
  closeEditTaskModal();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  updateTaskStats();
}

/* ----------------------------------------------
   4. RENDERIZAÇÃO E FILTROS DE INTERFACE
-----------------------------------------------*/

function renderTasks() {    
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  tasks.sort((a, b) => {
    const priorityOrder = {
      "🔴 Alta": 1,
      "🟡 Média": 2,
      "🟢 Baixa": 3
    };
    const orderA = priorityOrder[a.priority] || 4;
    const orderB = priorityOrder[b.priority] || 4;
    return orderA - orderB;
  });

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    li.innerHTML = `
      <label class="check-container">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${index})">
        <span class="checkmark"></span>
        <div>
          <div class="task-tags">
            <span class="task-priority">${task.priority}</span>
            <span class="task-category">${task.category}</span>
          </div>
          <span class="${task.completed ? "done" : ""}">
            ${task.text}
          </span>
        </div>
      </label>
      <div class="task-actions">
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">❌</button>
      </div>
    `;

    list.appendChild(li);
  });
}

/* ----------------------------------------------
   5. MÓDULO GAMIFICAÇÃO E CONTROLE DE CICLO
-----------------------------------------------*/

function startNewDay() {
  const confirmReset = confirm("Deseja iniciar um novo dia? Isso desmarcará as tarefas atuais.");
  if (!confirmReset) return;

  tasks = tasks.map(task => ({
    ...task,
    completed: false
  }));

  dayRewardClaimed = false;
  localStorage.setItem("dayRewardClaimed", false);
  localStorage.setItem("currentPlant", "🌱");
  localStorage.setItem("currentPlantProgress", 0);

  saveTasks();
  renderTasks();
  updateTaskStats();
}

function getPlantStage(progress) {
  if (progress < 25) return "🌱";
  if (progress < 50) return "🌿";
  if (progress < 75) return "🪴";
  if (progress < 100) return "🌳";
  return "🌳✨";
}

function updateTaskStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const currentPlant = getPlantStage(progress);

  localStorage.setItem("currentPlant", currentPlant);
  localStorage.setItem("currentPlantProgress", progress);

  if (progress < 100 && dayRewardClaimed) {
    dayRewardClaimed = false;
    localStorage.setItem("dayRewardClaimed", false);
  }

  if (total > 0 && progress === 100 && (!dayRewardClaimed)) {
    let savedTrees = Number(localStorage.getItem("forestTrees")) || 0;
    let savedXP = Number(localStorage.getItem("forestXP")) || 0;

    savedTrees += 1;
    savedXP += 10;
    dayRewardClaimed = true;

    localStorage.setItem("forestTrees", savedTrees);
    localStorage.setItem("forestXP", savedXP);
    localStorage.setItem("dayRewardClaimed", true);

    setTimeout(() => {
      alert(`🎉 PARABÉNS!\n\nVocê concluiu todas as tarefas do dia!\n\n🌳 +1 árvore | ⭐ +10 XP\n\nClique em "Novo Dia" para continuar.`);
    }, 300);
  }

  const taskCounterEl = document.getElementById("taskCounter");
  const completedCounterEl = document.getElementById("completedCounter");
  const progressTextEl = document.getElementById("progressText");
  const progressFillEl = document.getElementById("progressFill");
  const plantDisplayEl = document.getElementById("plantDisplay");

  if (taskCounterEl) taskCounterEl.textContent = pending;
  if (completedCounterEl) completedCounterEl.textContent = done;
  if (progressTextEl) progressTextEl.textContent = progress + "%";
  if (progressFillEl) progressFillEl.style.width = progress + "%";
  if (plantDisplayEl) plantDisplayEl.textContent = currentPlant;
}

/* ----------------------------------------------
   6. GATILHO DE EXECUÇÃO E EVENTOS 
-----------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  renderTasks();
  updateTaskStats();

  const taskInput = document.getElementById("taskInput");
  if (taskInput) {
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addTask();
      }
    });
  }

  document.getElementById("editTaskCancelBtn")?.addEventListener("click", closeEditTaskModal);
  document.getElementById("editTaskSaveBtn")?.addEventListener("click", saveEditTask);
  document.getElementById("editTaskModal")?.addEventListener("click", (e) => {
    if (e.target.id === "editTaskModal") closeEditTaskModal();
  });
  document.getElementById("editTaskInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEditTask();
  });
});