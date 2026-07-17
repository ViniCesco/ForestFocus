// ========================================
// 1. CONFIGURAÇÕES E SINALIZADORES GLOBAIS
// ========================================
const today = new Date();

// ========================================
// 2. MAPEAMENTO DE ELEMENTOS DO DOM
// ========================================

// Métricas e Contadores
const taskCounter = document.getElementById("taskCounter");
const completedCounter = document.getElementById("completedCounter");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

// Gamificação
const plantStage = document.getElementById("plantStage");
const plantProgress = document.getElementById("plantProgress");
const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const levelFill = document.getElementById("levelFill");

// Financeiro e Metas
const financeMonth = document.getElementById("financeMonth");
const balanceText = document.getElementById("balanceText");
const incomeText = document.getElementById("incomeText");
const expenseText = document.getElementById("expenseText");
const dashboardGoalsContent = document.getElementById("dashboardGoalsContent");

// Cards de Integração (Energia e Calendário)
const dashEnergyEmoji = document.getElementById("dashEnergyEmoji");
const dashEnergyLabel = document.getElementById("dashEnergyLabel");
const dashEnergyNote = document.getElementById("dashEnergyNote");
const dashEventTitle = document.getElementById("dashEventTitle");
const dashEventBadge = document.getElementById("dashEventBadge");

const months = [
"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ========================================
// 3. TAREFAS (lê "tasks" salvo pela página Tarefas)
// ========================================
function updateTaskDashboard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  if (taskCounter) taskCounter.textContent = pending;
  if (completedCounter) completedCounter.textContent = done;
  if (progressText) progressText.textContent = progress + "%";
  if (progressFill) progressFill.style.width = progress + "%";
}

// ========================================
// 4. PLANTA (lê "currentPlant"/"currentPlantProgress" salvo pela página Tarefas)
// ========================================
function updatePlantDashboard() {
  const plant = localStorage.getItem("currentPlant") || "🌱";
  const progress = Number(localStorage.getItem("currentPlantProgress")) || 0;

  if (plantStage) plantStage.textContent = plant;
  if (plantProgress) {
    plantProgress.textContent = progress >= 100 ? "Totalmente crescida!" : `${progress}% do dia`;
  }
}

// ========================================
// 5. NÍVEL / XP (lê "forestXP" salvo pela página Tarefas)
// ========================================
function updateLevelDashboard() {
  const xp = Number(localStorage.getItem("forestXP")) || 0;
  const level = Math.min(Math.floor(xp / 100) + 1, 10);
  const isMaxLevel = level >= 10;
  const xpIntoLevel = xp - (level - 1) * 100;
  const percent = isMaxLevel ? 100 : Math.min(Math.round((xpIntoLevel / 100) * 100), 100);

  if (levelText) levelText.textContent = `Nível ${level}`;
  if (levelFill) levelFill.style.width = percent + "%";
  if (xpText) {
    xpText.textContent = isMaxLevel ? `${xp} XP (máximo)` : `${xpIntoLevel}/100 XP`;
  }
}

// ========================================
// 6. FINANÇAS (lê "forestTransactions" salvo pela página Finanças)
// ========================================
function updateFinanceDashboard() {
  const finances = JSON.parse(localStorage.getItem("forestTransactions")) || [];
  const now = new Date();
  const currentMonthKey = `${months[now.getMonth()]} / ${now.getFullYear()}`;

  let income = 0;
  let expense = 0;

  finances.forEach(f => {
    if (f.monthKey === currentMonthKey) {
      if (f.type === "Receita" || f.type === "income") income += f.value;
      else expense += f.value;
    }
  });

  const balance = income - expense;

  if (financeMonth) financeMonth.textContent = currentMonthKey;
  if (balanceText) {
    balanceText.textContent = formatMoney(balance);
    balanceText.style.color = balance >= 0 ? "var(--text-white)" : "var(--danger)";
  }
  if (incomeText) incomeText.textContent = `📈 ${formatMoney(income)}`;
  if (expenseText) expenseText.textContent = `📉 ${formatMoney(expense)}`;
}

// ========================================
// 7. METAS (lê "forestGoals" salvo pela página Metas)
// ========================================
function renderDashboardGoals() {
  if (!dashboardGoalsContent) return;

  const goals = JSON.parse(localStorage.getItem("forestGoals")) || [];

  if (goals.length === 0) {
    dashboardGoalsContent.innerHTML = `<p class="empty-text">Nenhuma meta cadastrada ainda.</p>`;
    return;
  }

  const pending = goals.filter(g => g.current < g.target);
  const toShow = (pending.length > 0 ? pending : goals).slice(0, 3);

  dashboardGoalsContent.innerHTML = toShow.map(goal => {
    const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    return `<div class="dash-goal-item">${goal.title} — ${percent}%</div>`;
  }).join("");
}

// ========================================
// 8. ENERGIA (lê "forestMoodLogs" salvo pela página Energia)
// ========================================
function updateDashboardEnergyCard() {
  const moodEmoji = {
    "Ultra Focado": "⚡",
    "Energia Alta": "🔋",
    "Equilibrado": "⚖️",
    "Fadiga Mental": "📉",
    "Bloqueio Criativo": "🚫",
    "Exaustão": "💤"
  };

  const logs = JSON.parse(localStorage.getItem("forestMoodLogs")) || [];

  if (logs.length === 0) {
    if (dashEnergyEmoji) dashEnergyEmoji.textContent = "🔋";
    if (dashEnergyLabel) dashEnergyLabel.textContent = "Sem registros";
    if (dashEnergyNote) dashEnergyNote.textContent = "Registre seu estado na página de Energia.";
    return;
  }

  const latest = logs[0];
  if (dashEnergyEmoji) dashEnergyEmoji.textContent = moodEmoji[latest.mood] || "🔋";
  if (dashEnergyLabel) dashEnergyLabel.textContent = latest.mood;
  if (dashEnergyNote) dashEnergyNote.textContent = latest.note ? `"${latest.note}"` : "Sem observações";
}

// ========================================
// 9. PRÓXIMO EVENTO (lê "forestCalendarEvents" salvo pela página Calendário)
// ========================================
function updateDashboardNextEventCard() {
  const events = JSON.parse(localStorage.getItem("forestCalendarEvents")) || [];
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const upcoming = events.filter(e => {
    return e.date > todayStr || (e.date === todayStr && (e.time || "23:59") >= currentTimeStr);
  });

  if (upcoming.length === 0) {
    if (dashEventTitle) dashEventTitle.textContent = "Nenhum evento agendado";
    if (dashEventBadge) dashEventBadge.textContent = "--";
    return;
  }

  upcoming.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "23:59").localeCompare(b.time || "23:59"));
  const next = upcoming[0];
  const [, m, d] = next.date.split("-");

  if (dashEventTitle) dashEventTitle.textContent = next.title;
  if (dashEventBadge) dashEventBadge.textContent = `${d}/${m}`;
}

// ========================================
// 10. INICIALIZAÇÃO DO SISTEMA
// (o menu mobile é inicializado por menu.js, incluído no HTML antes
//  deste arquivo — não precisa chamar nada aqui)
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  updateTaskDashboard();
  updateFinanceDashboard();
  updatePlantDashboard();
  updateLevelDashboard();
  renderDashboardGoals();
  updateDashboardEnergyCard();
  updateDashboardNextEventCard();
});