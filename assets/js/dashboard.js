/* ----------------------------------------------
   1. CONFIGURAÇÕES GERAIS E AUXILIARES
-----------------------------------------------*/

/* Formatação de valores numéricos para o padrão de moeda brasileiro (R$) */
function formatMoney(value) {
  if (typeof value !== "number") value = Number(value);
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* Retorna o nome por extenso do mês com base no seu índice numérico */
function getMonthName(month) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month];
}

/* Converte strings de data de forma segura (suporta AAAA-MM-DD e DD/MM/AAAA) */
function parseCalendarDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Se o objeto de data já for uma instância de Date ou um timestamp numérico
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'number') return new Date(dateStr);
  
  // Se for uma string
  if (typeof dateStr === 'string') {
    // Se já for no formato ISO/US (AAAA-MM-DD)
    if (dateStr.includes('-')) {
      return new Date(dateStr + "T00:00:00");
    }
    
    // Se for no formato BR (DD/MM/AAAA)
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 0, 0, 0);
      }
    }
  }
  
  return new Date(dateStr);
}

/* ----------------------------------------------
   2. GERENCIAMENTO DE TAREFAS
-----------------------------------------------*/

/* Calcula as métricas de tarefas pendentes, concluídas e atualiza a barra de progresso */
function updateTaskDashboard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("taskCounter").textContent = pending;
  document.getElementById("completedCounter").textContent = completed;
  document.getElementById("progressText").textContent = progress + "%";
  document.getElementById("progressFill").style.width = progress + "%";
}

/* ----------------------------------------------
   3. MÓDULO GAMIFICAÇÃO (PLANTA E XP)
-----------------------------------------------*/

/* Define o emoji correspondente ao estágio atual de evolução da planta */
function getPlantStage(progress) {
  if (progress < 25) return "🌱";
  if (progress < 50) return "🌿";
  if (progress < 75) return "🪴";
  if (progress < 100) return "🌳";
  return "🌳✨";
}

/* Atualiza o emoji e o texto descritivo do estágio de crescimento da planta no painel */
function updatePlantDashboard() {
  const progress = Number(localStorage.getItem("currentPlantProgress")) || 0;
  const plant = localStorage.getItem("currentPlant") || "🌱";

  document.getElementById("plantStage").textContent = plant;

  let stageText = "";
  if (progress < 25) stageText = "Semente 🌱";
  else if (progress < 50) stageText = "Broto Inicial 🌿";
  else if (progress < 75) stageText = "Planta Jovem 🪴";
  else if (progress < 100) stageText = "Árvore Formada 🌳";
  else stageText = "Floresta Próspera 🌳✨";

  document.getElementById("plantProgress").textContent = stageText;
}

/* Sistema de XP e Nível: calcula o nível atual do usuário e atualiza a barra de experiência */
function updateLevelDashboard() {
  const xp = Number(localStorage.getItem("forestXP")) || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentXP = xp % 100;

  document.getElementById("levelText").textContent = `Nível ${level}`;
  document.getElementById("xpText").textContent = `${currentXP} / 100 XP`;
  document.getElementById("levelFill").style.width = currentXP + "%";
}

/* ----------------------------------------------
   4. PAINEL FINANCEIRO
-----------------------------------------------*/

/* Filtra as finanças do mês corrente e exibe o total de entradas, saídas e o saldo final */
function updateFinanceDashboard() {
  const finances = JSON.parse(localStorage.getItem("finances")) || [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

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

  document.getElementById("financeMonth").textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  document.getElementById("balanceText").textContent = formatMoney(balance);
  document.getElementById("incomeText").textContent = `📈 ${formatMoney(income)}`;
  document.getElementById("expenseText").textContent = `📉 ${formatMoney(expense)}`;
}

/* ----------------------------------------------
   5. PAINEL DE METAS
-----------------------------------------------*/

/* Renderiza o progresso geral das metas cadastradas, exibindo a porcentagem de conclusão */
function renderDashboardGoals() {
  const container = document.getElementById("dashboardGoalsContent");
  if (!container) return;

  const savedGoals = JSON.parse(localStorage.getItem("forestGoals")) || [];

  if (savedGoals.length === 0) {
    container.innerHTML = `<p style="color: #a0aec0; font-style: italic; margin: 0; font-size: 14px; text-align: center;">Nenhuma meta cadastrada ainda.</p>`;
    return;
  }

  const completedCount = savedGoals.filter(g => g.current >= g.target).length;
  const totalGoals = savedGoals.length;
  const totalPercent = Math.round((completedCount / totalGoals) * 100);

  container.innerHTML = `
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

/* ----------------------------------------------
   6. INTEGRACAO DOS CARDS DE ENERGIA E EVENTOS
-----------------------------------------------*/

/* Auxiliar para mapear emojis do sistema de energia */
function getDashboardEnergyEmoji(label) {
  switch (label) {
    case "Ultra Focado":        return "⚡";
    case "Produtivo":           return "🔋";
    case "Fadiga Mental":       return "📉";
    case "Bloqueio Criativo":    return "🚫";
    case "Instável/Distraído":  return "🎯";
    case "Cansado/Exausto":     return "💤";
    default:                    return "🔋";
  }
}

/* 1. Atualiza o Card de Energia com o último registro feito */
function updateDashboardEnergyCard() {
  const emojiElement = document.getElementById("dashEnergyEmoji");
  const labelElement = document.getElementById("dashEnergyLabel");
  const noteElement = document.getElementById("dashEnergyNote");

  if (!emojiElement || !labelElement || !noteElement) return;

  const rawLogs = localStorage.getItem("forestMoodLogs");
  
  if (rawLogs) {
    try {
      const logs = JSON.parse(rawLogs);
      if (logs && logs.length > 0) {
        const latestLog = logs[0];
        
        labelElement.textContent = latestLog.mood;
        emojiElement.textContent = getDashboardEnergyEmoji(latestLog.mood);
        
        if (latestLog.note && latestLog.note.trim() !== "") {
          noteElement.textContent = `"${latestLog.note}"`;
        } else {
          noteElement.textContent = "Nenhuma observação registrada";
        }
        return;
      }
    } catch (e) {
      console.error("Erro ao ler os logs de energia no painel:", e);
    }
  }

  labelElement.textContent = "Sem Registros";
  emojiElement.textContent = "💤";
  noteElement.textContent = "Registre sua energia na aba Energia.";
}

/* 2. Atualiza o Card de Calendário com o evento futuro mais próximo */
function updateDashboardNextEventCard() {
  const titleElement = document.getElementById("dashEventTitle");
  const badgeElement = document.getElementById("dashEventBadge");

  if (!titleElement || !badgeElement) return;

  // Corrigido para a chave real do seu sistema: forestCalendarEvents
  const rawEvents = localStorage.getItem("forestCalendarEvents");
  
  if (rawEvents) {
    try {
      const events = JSON.parse(rawEvents);
      if (events && events.length > 0) {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Zera hora para comparação de dias pura
        
        // Mapeia e analisa a leitura de datas futuras/atuais
        const upcomingEvents = events
          .map(ev => ({ 
             ...ev, 
             // Garante a leitura independente se a propriedade for 'date', 'start' ou 'data'
             parsedDate: parseCalendarDate(ev.date || ev.start || ev.data) 
          }))
          .filter(ev => {
             const tempDate = new Date(ev.parsedDate.getTime());
             return tempDate.setHours(23, 59, 59, 999) >= now.getTime();
          })
          .sort((a, b) => a.parsedDate - b.parsedDate);

        if (upcomingEvents.length > 0) {
          const nextEvent = upcomingEvents[0];
          
          // Garante o título independente se for 'title' ou 'text'
          titleElement.textContent = nextEvent.title || nextEvent.text || nextEvent.descricao;
          
          const day = String(nextEvent.parsedDate.getDate()).padStart(2, '0');
          const month = String(nextEvent.parsedDate.getMonth() + 1).padStart(2, '0');
          
          const todayStr = new Date().toLocaleDateString('pt-BR');
          const eventStr = nextEvent.parsedDate.toLocaleDateString('pt-BR');
          
          if (todayStr === eventStr) {
            badgeElement.textContent = "Hoje";
            badgeElement.style.color = "#e53e3e";
            badgeElement.style.background = "rgba(229, 62, 62, 0.1)";
          } else {
            badgeElement.textContent = `${day}/${month}`;
            badgeElement.style.color = "#3182ce";
            badgeElement.style.background = "rgba(49, 130, 206, 0.1)";
          }
          return;
        }
      }
    } catch (e) {
      console.error("Erro ao ler os eventos do calendário no painel:", e);
    }
  }

  titleElement.textContent = "Nenhum evento agendado";
  badgeElement.textContent = "--";
  badgeElement.style.color = "#a0aec0";
  badgeElement.style.background = "rgba(255, 255, 255, 0.05)";
}

/* ----------------------------------------------
   7. REGISTRO DO SERVICE WORKER (OFFLINE)
-----------------------------------------------*/

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Modo offline ativado com sucesso!'))
    .catch(err => console.error('Erro ao ativar modo offline:', err));
}

/* ----------------------------------------------
   8. GATILHO DE EXECUÇÃO GLOBAL
-----------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  updateTaskDashboard();
  updateFinanceDashboard();
  updatePlantDashboard();
  updateLevelDashboard();
  renderDashboardGoals();
  
  // Executa os novos cards de integração
  updateDashboardEnergyCard();
  updateDashboardNextEventCard();
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