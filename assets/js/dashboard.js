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

// Menu Responsivo
const sidebar = document.querySelector(".sidebar");
const menuButton = document.querySelector(".menu-toggle");
const mainContent = document.querySelector(".main-content");

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ========================================
// 3. INICIALIZAÇÃO DO SISTEMA
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa todos os módulos do Painel Principal
    updateTaskDashboard();
    updateFinanceDashboard();
    updatePlantDashboard();
    updateLevelDashboard();
    renderDashboardGoals();
    updateDashboardEnergyCard();
    updateDashboardNextEventCard();
    
    initResponsiveMenu();
});

// ========================================
// 4. OUVINTES DE EVENTOS (LISTENERS)
// ========================================
function initResponsiveMenu() {
    if (!sidebar || !menuButton || !mainContent) return;

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        mainContent.classList.toggle("menu-expanded");
    });
}

// ========================================
// 5. FUNÇÕES AUXILIARES E FORMATADORES
// ========================================
function formatMoney(value) {
    if (typeof value !== "number") value = Number(value);
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function getMonthName(monthIndex) {
    return months[monthIndex];
}

function parseCalendarDate(dateStr) {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'number') return new Date(dateStr);
    
    if (typeof dateStr === 'string') {
        if (dateStr.includes('-')) {
            return new Date(dateStr + "T00:00:00");
        }
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 0, 0, 0);
            }
        }
    }
    return new Date(dateStr);
}

function getPlantStage(progress) {
    if (progress < 25) return "🌱";
    if (progress < 50) return "🌿";
    if (progress < 75) return "🪴";
    if (progress < 100) return "🌳";
    return "🌳✨";
}

function getDashboardEnergyEmoji(label) {
    switch (label) {
        case "Ultra Focado":         return "⚡";
        case "Produtivo":           return "🔋";
        case "Fadiga Mental":       return "📉";
        case "Bloqueio Criativo":    return "🚫";
        case "Instável/Distraído":  return "🎯";
        case "Cansado/Exausto":     return "💤";
        default:                    return "🔋";
    }
}

// ========================================
// 6. ATUALIZAÇÃO DE COMPONENTES VISUAIS (CARDS / REGRAS)
// ========================================

// Módulo de Tarefas
function updateTaskDashboard() {
    if (!taskCounter || !completedCounter || !progressText || !progressFill) return;

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    taskCounter.textContent = pending;
    completedCounter.textContent = completed;
    progressText.textContent = progress + "%";
    progressFill.style.width = progress + "%";
}

// Módulo Gamificação (Planta e Níveis)
function updatePlantDashboard() {
    if (!plantStage || !plantProgress) return;

    const progress = Number(localStorage.getItem("currentPlantProgress")) || 0;
    const plant = localStorage.getItem("currentPlant") || "🌱";

    plantStage.textContent = plant;

    let stageText = "";
    if (progress < 25) stageText = "Semente 🌱";
    else if (progress < 50) stageText = "Broto Inicial 🌿";
    else if (progress < 75) stageText = "Planta Jovem 🪴";
    else if (progress < 100) stageText = "Árvore Formada 🌳";
    else stageText = "Floresta Próspera 🌳✨";

    plantProgress.textContent = stageText;
}

function updateLevelDashboard() {
    if (!levelText || !xpText || !levelFill) return;

    const xp = Number(localStorage.getItem("forestXP")) || 0;
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;

    levelText.textContent = `Nível ${level}`;
    xpText.textContent = `${currentXP} / 100 XP`;
    levelFill.style.width = currentXP + "%";
}

// Módulo Painel Financeiro
function updateFinanceDashboard() {
    if (!financeMonth || !balanceText || !incomeText || !expenseText) return;

    const finances = JSON.parse(localStorage.getItem("finances")) || [];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let income = 0;
    let expense = 0;

    finances.forEach(finance => {
        const date = new Date(finance.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            if (finance.type === "income") {
                income += finance.value;
            } else {
                expense += finance.value;
            }
        }
    });

    const balance = income - expense;

    financeMonth.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    balanceText.textContent = formatMoney(balance);
    incomeText.textContent = `📈 ${formatMoney(income)}`;
    expenseText.textContent = `📉 ${formatMoney(expense)}`;
}

// Card de Energia (Integração)
function updateDashboardEnergyCard() {
    if (!dashEnergyEmoji || !dashEnergyLabel || !dashEnergyNote) return;

    const rawLogs = localStorage.getItem("forestMoodLogs");
    
    if (rawLogs) {
        try {
            const logs = JSON.parse(rawLogs);
            if (logs && logs.length > 0) {
                const latestLog = logs[0];
                
                dashEnergyLabel.textContent = latestLog.mood;
                dashEnergyEmoji.textContent = getDashboardEnergyEmoji(latestLog.mood);
                
                dashEnergyNote.textContent = (latestLog.note && latestLog.note.trim() !== "") 
                    ? `"${latestLog.note}"` 
                    : "Nenhuma observação registrada";
                return;
            }
        } catch (e) {
            console.error("Erro ao ler os logs de energia no painel:", e);
        }
    }

    dashEnergyLabel.textContent = "Sem Registros";
    dashEnergyEmoji.textContent = "💤";
    dashEnergyNote.textContent = "Registre sua energia na aba Energia.";
}

// Card de Calendário (Integração)
function updateDashboardNextEventCard() {
    if (!dashEventTitle || !dashEventBadge) return;

    const rawEvents = localStorage.getItem("forestCalendarEvents");
    
    if (rawEvents) {
        try {
            const events = JSON.parse(rawEvents);
            if (events && events.length > 0) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                const upcomingEvents = events
                    .map(ev => ({ 
                        ...ev, 
                        parsedDate: parseCalendarDate(ev.date || ev.start || ev.data) 
                    }))
                    .filter(ev => {
                        const tempDate = new Date(ev.parsedDate.getTime());
                        return tempDate.setHours(23, 59, 59, 999) >= now.getTime();
                    })
                    .sort((a, b) => a.parsedDate - b.parsedDate);

                if (upcomingEvents.length > 0) {
                    const nextEvent = upcomingEvents[0];
                    
                    dashEventTitle.textContent = nextEvent.title || nextEvent.text || nextEvent.descricao;
                    
                    const day = String(nextEvent.parsedDate.getDate()).padStart(2, '0');
                    const month = String(nextEvent.parsedDate.getMonth() + 1).padStart(2, '0');
                    
                    const todayStr = today.toLocaleDateString('pt-BR');
                    const eventStr = nextEvent.parsedDate.toLocaleDateString('pt-BR');
                    
                    if (todayStr === eventStr) {
                        dashEventBadge.textContent = "Hoje";
                        dashEventBadge.style.color = "#e53e3e";
                        dashEventBadge.style.background = "rgba(229, 62, 62, 0.1)";
                    } else {
                        dashEventBadge.textContent = `${day}/${month}`;
                        dashEventBadge.style.color = "#3182ce";
                        dashEventBadge.style.background = "rgba(49, 130, 206, 0.1)";
                    }
                    return;
                }
            }
        } catch (e) {
            console.error("Erro ao ler os eventos do calendário no painel:", e);
        }
    }

    dashEventTitle.textContent = "Nenhum evento agendado";
    dashEventBadge.textContent = "--";
    dashEventBadge.style.color = "#a0aec0";
    dashEventBadge.style.background = "rgba(255, 255, 255, 0.05)";
}

// ========================================
// 7. RENDERIZAÇÃO DE LISTAS DINÂMICAS
// ========================================

// Módulo de Metas
function renderDashboardGoals() {
    if (!dashboardGoalsContent) return;

    const savedGoals = JSON.parse(localStorage.getItem("forestGoals")) || [];

    if (savedGoals.length === 0) {
        dashboardGoalsContent.innerHTML = `<p style="color: #a0aec0; font-style: italic; margin: 0; font-size: 14px; text-align: center;">Nenhuma meta cadastrada ainda.</p>`;
        return;
    }

    const completedCount = savedGoals.filter(g => g.current >= g.target).length;
    const totalGoals = savedGoals.length;
    const totalPercent = Math.round((completedCount / totalGoals) * 100);

    dashboardGoalsContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; width: 100%;">
            <span style="font-size: 14px; color: #fff; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                📊 ${completedCount} de ${totalGoals} concluídas
            </span>
            <span style="font-size: 14px; color: #a78bfa; font-weight: bold;">
                ${totalPercent}%
            </span>
        </div>
        <div class="progress-bar" style="width: 100%; height: 6px; background: #2d2d44; border-radius: 3px; overflow: hidden; margin: 0;">
            <div style="width: ${totalPercent}%; height: 100%; background: #6366f1; transition: width 0.5s ease;"></div>
        </div>
    `;
}

// ========================================
// 8. REGISTRO DE SERVICE WORKER (OFFLINE)
// ========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Modo offline ativado com sucesso!'))
        .catch(err => console.error('Erro ao ativar modo offline:', err));
}