/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/

console.log("Sistema Financeiro Carregado!");

let finances = [];
let showAllFinances = false;
let showAllMonthlyHistory = false; 

/* ----------------------------------------------
   2. FORMATADORES E UTILITÁRIOS
-----------------------------------------------*/


/* Formata valores para moeda brasileira (R$) */
function formatMoney(value) {

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getMonthName(month) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month];
}

function getCategoryIcon(category) {
  switch (category) {
    case "Salário":           return "💰";
    case "Extra":             return "💵";
    case "Investimentos":    return "📊";
    case "Fixo":             return "🎯";
    case "Moradia":          return "🏠";
    case "Mercado":          return "🛒";
    case "Alimentação":      return "🍔";
    case "Saúde":            return "❤️";
    case "Educação":         return "🎓";
    case "Transporte":       return "🚌";
    case "Lazer":            return "🎮";
    case "Pix":              return "💲";
    case "Cartão de crédito": return "💳";
    case "Outros":           return "📦";
    default:                 return "📝";
  }
}


/* ----------------------------------------------
   3. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
-----------------------------------------------*/

/* Recupera os registros financeiros salvos localmente no navegador */
function loadFinances() {
  const savedFinances = localStorage.getItem("finances");
  if (savedFinances) {
    finances = JSON.parse(savedFinances);
  }
}

/* Salva a lista atual de finanças no armazenamento local do navegador */
function saveFinances() {
  localStorage.setItem("finances", JSON.stringify(finances));
}

/* ----------------------------------------------
   4. ENTRADA DE MOVIMENTAÇÕES (AÇÕES)
-----------------------------------------------*/

function addIncome() {
  const description = document.getElementById("financeDescription").value.trim();
  const value = Number(document.getElementById("financeValue").value);
  const category = document.getElementById("financeCategory").value;

  if (description === "" || value <= 0) return;

  finances.push({
    type: "income",
    description: description,
    category: category,
    value: value,
    date: new Date().toISOString()
  });

  saveFinances();
  updateAllFinanceViews();

  document.getElementById("financeDescription").value = "";
  document.getElementById("financeValue").value = "";
  document.getElementById("financeCategory").selectedIndex = 0;
}

function addExpense() {
  const description = document.getElementById("financeDescription").value.trim();
  const value = Number(document.getElementById("financeValue").value);
  const category = document.getElementById("financeCategory").value;

  if (description === "" || value <= 0) return;

  finances.push({
    type: "expense",
    description: description,
    category: category,
    value: value,
    date: new Date().toISOString()
  });

  saveFinances();
  updateAllFinanceViews();

  document.getElementById("financeDescription").value = "";
  document.getElementById("financeValue").value = "";
  document.getElementById("financeCategory").selectedIndex = 0;
}

/* ----------------------------------------------
   5. ESTILOS E COMPONENTES DE INTERFACE
-----------------------------------------------*/

function updateCurrentMonthTitle() {
  const title = document.getElementById("currentMonthTitle");
  if (!title) return;

  const today = new Date();
  title.textContent = `📄 ${getMonthName(today.getMonth())} ${today.getFullYear()}`;
}

function populateMonthFilter() {
  const filter = document.getElementById("monthFilter");
  if (!filter) return;

  filter.innerHTML = `<option value="all">📅 Todos os meses</option>`;
  const months = [];

  finances.forEach(finance => {
    const date = new Date(finance.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!months.includes(key)) months.push(key);
  });

  months.reverse().forEach(key => {
    const [year, month] = key.split("-");
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `📌 ${getMonthName(Number(month))} ${year}`;
    filter.appendChild(option);
  });
}

function toggleFinanceHistory() {
  showAllFinances = !showAllFinances;
  const text = document.getElementById("toggleFinanceText");
  const icon = document.getElementById("toggleFinanceIcon");

  if (showAllFinances) {
    if (text) text.textContent = "Mostrar menos";
    if (icon) icon.textContent = "▲";
  } else {
    if (text) text.textContent = "Mostrar mais";
    if (icon) icon.textContent = "▼";
  }
  renderFinances();
}

/* ----------------------------------------------
   6. RENDERIZAÇÃO DOS LISTADOS (MÊS ATUAL)
-----------------------------------------------*/

function renderFinances() {
  const financeHistory = document.getElementById("financeHistory");
  if (!financeHistory) return;

  financeHistory.innerHTML = "";

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthFinances = finances.filter(finance => {
    if (!finance.date) return false;
    const date = new Date(finance.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const financesToShow = showAllFinances
    ? [...currentMonthFinances].reverse()
    : [...currentMonthFinances].reverse().slice(0, 3);

  financesToShow.forEach(finance => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    const deleteButton = document.createElement("button");

    const dateStr = finance.date 
      ? new Date(finance.date).toLocaleDateString("pt-BR") 
      : "Sem data";

    const isIncome = finance.type === "income";
    text.className = isIncome ? "income" : "";
    
    text.innerHTML = `
      <span class="finance-description">${finance.description}</span>
      <span class="finance-date">${dateStr} • ${getCategoryIcon(finance.category)} ${finance.category}</span>
      <span class="${isIncome ? 'income-value' : 'expense-value'}">
        ${isIncome ? '+' : '-'} ${formatMoney(finance.value)}
      </span>
    `;

    deleteButton.innerHTML = "❌";
    deleteButton.className = "delete-finance";
    deleteButton.onclick = () => {
      const realIndex = finances.indexOf(finance);
      if (realIndex !== -1) {
        finances.splice(realIndex, 1);
        saveFinances();
        updateAllFinanceViews();
      }
    };

    li.appendChild(text);
    li.appendChild(deleteButton);
    financeHistory.appendChild(li);
  });

  const toggleButton = document.getElementById("toggleFinanceHistory");
  if (toggleButton) {
    toggleButton.style.display = currentMonthFinances.length <= 3 ? "none" : "flex";
  }
}

/* ----------------------------------------------
   7. HISTÓRICO MENSAL ACUMULADO
-----------------------------------------------*/

function renderMonthlyHistory() {
  const container = document.getElementById("monthlyHistory");
  if (!container) return;

  container.innerHTML = "";
  const selectedMonth = document.getElementById("monthFilter")?.value || "all";
  const monthlyData = {};

  finances.forEach(finance => {
    const date = finance.date ? new Date(finance.date) : new Date();
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0 };
    }

    if (finance.type === "income") {
      monthlyData[key].income += finance.value;
    } else {
      monthlyData[key].expense += finance.value;
    }
  });

  const filteredKeys = Object.keys(monthlyData)
    .reverse()
    .filter(key => selectedMonth === "all" || key === selectedMonth);

  const keysToShow = showAllMonthlyHistory
    ? filteredKeys
    : filteredKeys.slice(0, 3);

  keysToShow.forEach(key => {
    const [year, month] = key.split("-");
    const data = monthlyData[key];
    const card = document.createElement("div");
    card.className = "month-card";

    const balance = data.income - data.expense;
    const monthFinances = finances.filter(finance => {
      const fDate = new Date(finance.date);
      return fDate.getMonth() === Number(month) && fDate.getFullYear() === Number(year);
    });

    card.innerHTML = `
      <h3>${getMonthName(Number(month))} ${year}</h3>
      <details>
        <summary>Ver lançamentos</summary>
        <div class="month-details">
          <p>📈 Receitas: ${formatMoney(data.income)}</p>
          <p>📉 Despesas: ${formatMoney(data.expense)}</p>
          <p>💰 Saldo: ${formatMoney(balance)}</p>
          <hr>
          <div class="month-transactions">
            ${monthFinances.map(f => `
              <div class="history-line">
                ${f.description} • ${getCategoryIcon(f.category)} ${f.category || "Outros"} • 
                <span class="${f.type === 'income' ? 'income-value' : 'expense-value'}">
                  ${f.type === 'income' ? '+' : '-'} ${formatMoney(f.value)}
                </span>
              </div>
            `).join("")}
          </div>
        </div>
      </details>
    `;
    container.appendChild(card);
  });

  document.getElementById("toggleMonthlyHistoryButton")?.remove();

  if (filteredKeys.length > 3) {
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "toggleMonthlyHistoryButton";
    toggleBtn.style.cssText = "width:100%; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:6px; color:#a0aec0; font-size:14px; cursor:pointer; margin-top:15px; transition:background 0.2s; display:flex; justify-content:center; align-items:center; gap:8px;";
    toggleBtn.innerHTML = showAllMonthlyHistory 
      ? `<span id="toggleMonthlyText">Mostrar menos</span> <span id="toggleMonthlyIcon">▲</span>`
      : `<span id="toggleMonthlyText">Mostrar mais</span> <span id="toggleMonthlyIcon">▼</span>`;
    
    toggleBtn.addEventListener("mouseenter", () => toggleBtn.style.background = "rgba(255,255,255,0.05)");
    toggleBtn.addEventListener("mouseleave", () => toggleBtn.style.background = "rgba(255,255,255,0.02)");
    
    toggleBtn.addEventListener("click", () => {
      showAllMonthlyHistory = !showAllMonthlyHistory;
      renderMonthlyHistory();
    });
    
    container.appendChild(toggleBtn);
  }
}

/* ----------------------------------------------
   8. CONTADORES FINANCEIROS (MÊS CORRENTE)
-----------------------------------------------*/

function updateFinanceSummary() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let income = 0;
  let expense = 0;

  finances.forEach(finance => {
    const date = new Date(finance.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (finance.type === "income") income += finance.value;
      else expense += finance.value;
    }
  });

  const incomeElement = document.getElementById("incomeTotal");
  const expenseElement = document.getElementById("expenseTotal");

  if (incomeElement) incomeElement.textContent = formatMoney(income);
  if (expenseElement) expenseElement.textContent = formatMoney(expense);
}

function updateBalance() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let balance = 0;

  finances.forEach(finance => {
    const date = new Date(finance.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (finance.type === "income") balance += finance.value;
      else balance -= finance.value;
    }
  });

  const balanceElement = document.getElementById("financeBalance");
  if (balanceElement) balanceElement.textContent = formatMoney(balance);
}

/* ----------------------------------------------
   9. CONTROLADOR CENTRAL DE ATUALIZAÇÃO
-----------------------------------------------*/

function updateAllFinanceViews() {
  populateMonthFilter();
  renderFinances();
  updateBalance();
  updateFinanceSummary();
  renderMonthlyHistory();
  updateCurrentMonthTitle();
}

/* ----------------------------------------------
   10. DISPARO INICIAL
-----------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  loadFinances();
  updateAllFinanceViews();

document.getElementById("monthFilter")?.addEventListener("change", () => {
    showAllMonthlyHistory = false;
    renderMonthlyHistory();
  });
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