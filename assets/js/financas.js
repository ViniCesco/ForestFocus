/* ----------------------------------------------
   1. CONFIGURAÇÕES E ESTADO GLOBAL
-----------------------------------------------*/
console.log("Sistema Financeiro Inicializado com Sucesso!");

let finances = [];
let showAllFinances = false;

/* ----------------------------------------------
   2. FORMATADORES E UTILITÁRIOS
-----------------------------------------------*/
function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getMonthName(monthIndex) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[monthIndex];
}

function getCategoryIcon(category) {
  switch (category) {
    case "Salário":           return "💰";
    case "Extra":             return "💵";
    case "Investimentos":     return "📊";
    case "Fixo":              return "🎯";
    case "Moradia":           return "🏠";
    case "Mercado":           return "🛒";
    case "Alimentação":       return "🍔";
    case "Saúde":             return "❤️";
    case "Educação":          return "🎓";
    case "Transporte":        return "🚌";
    case "Lazer":             return "🎮";
    case "Pix":               return "💲";
    case "Cartão de crédito": return "💳";
    case "Outros":            return "📦";
    default:                  return "📝";
  }
}

function getMonthKey(dateObj) {
  return `${getMonthName(dateObj.getMonth())} / ${dateObj.getFullYear()}`;
}

/* ----------------------------------------------
   3. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
-----------------------------------------------*/
function loadFinances() {
  const savedFinances = localStorage.getItem("forestTransactions");
  finances = savedFinances ? JSON.parse(savedFinances) : [];
}

function saveFinances() {
  localStorage.setItem("forestTransactions", JSON.stringify(finances));
}

/* ----------------------------------------------
   4. ENTRADA E CONTROLE DE MOVIMENTAÇÕES
-----------------------------------------------*/
function addIncome() {
  handleNewTransaction("Receita");
}

function addExpense() {
  handleNewTransaction("Despesa");
}

function handleNewTransaction(type) {
  const descriptionInput = document.getElementById("financeDescription");
  const valueInput = document.getElementById("financeValue");
  const categoryInput = document.getElementById("financeCategory");

  if (!descriptionInput || !valueInput || !categoryInput) return;

  const description = descriptionInput.value.trim();
  const value = parseFloat(valueInput.value);
  const category = categoryInput.value;

  if (description === "" || isNaN(value) || value <= 0 || !category) {
    alert("Por favor, preencha todos os campos (Descrição, Valor e Categoria) corretamente.");
    return;
  }

  const today = new Date();
  finances.unshift({
    id: Date.now(),
    type: type,
    description: description,
    category: category,
    value: value,
    date: today.toLocaleDateString("pt-BR"),
    monthKey: getMonthKey(today)
  });

  saveFinances();
  updateAllFinanceViews();

  descriptionInput.value = "";
  valueInput.value = "";
  categoryInput.value = "";
}

/* Estado de qual lançamento está sendo editado no momento pelo modal */
let editingFinanceId = null;

/* Abre o modal de edição preenchido com os dados atuais do lançamento */
function editTransaction(id) {
  const transaction = finances.find(f => f.id === id);
  if (!transaction) return;

  editingFinanceId = id;

  const modal = document.getElementById("editFinanceModal");
  const descInput = document.getElementById("editFinanceDescription");
  const valueInput = document.getElementById("editFinanceValue");
  const error = document.getElementById("editFinanceError");
  if (!modal || !descInput || !valueInput) return;

  descInput.value = transaction.description;
  valueInput.value = transaction.value;
  if (error) error.textContent = "";
  modal.classList.add("active");
  descInput.focus();
}

function closeEditFinanceModal() {
  const modal = document.getElementById("editFinanceModal");
  if (modal) modal.classList.remove("active");
  editingFinanceId = null;
}

function saveEditFinance() {
  const descInput = document.getElementById("editFinanceDescription");
  const valueInput = document.getElementById("editFinanceValue");
  const error = document.getElementById("editFinanceError");
  if (!descInput || !valueInput || editingFinanceId === null) return;

  const newDescription = descInput.value.trim();
  const newValue = parseFloat(valueInput.value);

  if (newDescription === "") {
    if (error) error.textContent = "A descrição não pode ficar vazia.";
    return;
  }
  if (isNaN(newValue) || newValue <= 0) {
    if (error) error.textContent = "Informe um valor válido maior que zero.";
    return;
  }

  const transaction = finances.find(f => f.id === editingFinanceId);
  if (!transaction) return;

  transaction.description = newDescription;
  transaction.value = newValue;

  saveFinances();
  updateAllFinanceViews();
  closeEditFinanceModal();
}

function deleteTransaction(id) {
  finances = finances.filter(f => f.id !== id);
  saveFinances();
  updateAllFinanceViews();
}

function toggleFinanceHistory() {
  showAllFinances = !showAllFinances;
  renderFinances();
}

/* ----------------------------------------------
   5. RENDERIZAÇÃO DA INTERFACE (DOM)
-----------------------------------------------*/
function renderFinances() {
  const financeHistory = document.getElementById("financeHistory");
  const toggleButton = document.getElementById("toggleFinanceHistory");
  const toggleText = document.getElementById("toggleFinanceText");
  const toggleIcon = document.getElementById("toggleFinanceIcon");

  if (!financeHistory) return;
  financeHistory.innerHTML = "";

  const currentMonthKey = getMonthKey(new Date());
  const currentMonthFinances = finances.filter(f => f.monthKey === currentMonthKey);

  const financesToShow = showAllFinances
    ? currentMonthFinances
    : currentMonthFinances.slice(0, 3);

  if (currentMonthFinances.length === 0) {
    financeHistory.innerHTML = `<div class="meta-empty">Nenhum lançamento registrado este mês.</div>`;
  } else {
    financesToShow.forEach(finance => {
      const item = document.createElement("div");
      item.className = "finance-item";

      const isIncome = finance.type === "Receita" || finance.type === "income";
      const valClass = isIncome ? "income-value" : "expense-value";
      const sign = isIncome ? "+" : "-";

      item.innerHTML = `
        <div class="finance-info-block">
          <span class="finance-description">${finance.description}</span>
          <div class="finance-details-sub">
            <span>${getCategoryIcon(finance.category)} ${finance.category}</span>
            <span>📅 ${finance.date}</span>
          </div>
        </div>
        <div class="finance-value-block">
          <span class="${valClass}">${sign} ${formatMoney(finance.value)}</span>
          <button class="delete-finance" onclick="editTransaction(${finance.id})" title="Editar" style="color: var(--text-muted); margin-right: 8px;">📝</button>
          <button class="delete-finance" onclick="deleteTransaction(${finance.id})" title="Excluir">🗑️</button>
        </div>
      `;
      financeHistory.appendChild(item);
    });
  }

  if (toggleButton) {
    if (currentMonthFinances.length > 3) {
      toggleButton.style.display = "flex";
      if (toggleText) toggleText.textContent = showAllFinances ? "Mostrar menos" : "Mostrar mais";
      if (toggleIcon) toggleIcon.style.transform = showAllFinances ? "rotate(180deg)" : "rotate(0deg)";
    } else {
      toggleButton.style.display = "none";
    }
  }
}

function renderMonthlyHistory() {
  const container = document.getElementById("monthlyHistory");
  const filterElement = document.getElementById("monthFilter");
  if (!container || !filterElement) return;

  container.innerHTML = "";
  const selectedMonth = filterElement.value || "all";
  const monthlyData = {};

  finances.forEach(finance => {
    // CORREÇÃO: "currentMonthKey" não existia nesse escopo (variável não
    // declarada aqui); trocado pelo próprio monthKey já salvo na transação.
    const key = finance.monthKey || getMonthKey(new Date());
    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0 };
    }
    if (finance.type === "Receita" || finance.type === "income") {
      monthlyData[key].income += finance.value;
    } else {
      monthlyData[key].expense += finance.value;
    }
  });

  const filteredKeys = Object.keys(monthlyData)
    .sort().reverse()
    .filter(key => selectedMonth === "all" || key === selectedMonth);

  if (filteredKeys.length === 0) {
    container.innerHTML = `<div class="meta-empty">Nenhum registro histórico acumulado.</div>`;
    return;
  }

  filteredKeys.forEach(key => {
    const data = monthlyData[key];
    const card = document.createElement("div");
    card.className = "month-card";

    const balance = data.income - data.expense;
    const balColor = balance >= 0 ? "var(--success)" : "var(--danger)";

    card.innerHTML = `
      <h3>📅 ${key}</h3>
      <p>📈 Receitas: <span style="color: var(--success)">${formatMoney(data.income)}</span></p>
      <p>📉 Despesas: <span style="color: var(--danger)">${formatMoney(data.expense)}</span></p>
      <p>💰 Saldo Mensal: <span style="color: ${balColor}">${formatMoney(balance)}</span></p>
    `;
    container.appendChild(card);
  });
}

function populateMonthFilter() {
  const filter = document.getElementById("monthFilter");
  if (!filter) return;

  const previousSelection = filter.value;
  filter.innerHTML = `<option value="all">↘️ Todos os meses</option>`;
  
  const uniqueMonths = [...new Set(finances.map(f => f.monthKey))].sort().reverse();

  uniqueMonths.forEach(m => {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = `📅 ${m}`;
    filter.appendChild(option);
  });

  filter.value = previousSelection || "all";
}

function updateFinanceSummary() {
  const currentMonthKey = getMonthKey(new Date());
  let income = 0;
  let expense = 0;

  finances.forEach(finance => {
    if (finance.monthKey === currentMonthKey) {
      if (finance.type === "Receita" || finance.type === "income") income += finance.value;
      else expense += finance.value;
    }
  });

  const incomeElement = document.getElementById("incomeTotal");
  const expenseElement = document.getElementById("expenseTotal");

  if (incomeElement) incomeElement.textContent = formatMoney(income);
  if (expenseElement) expenseElement.textContent = formatMoney(expense);
}

function updateBalance() {
  const currentMonthKey = getMonthKey(new Date());
  let balance = 0;

  finances.forEach(finance => {
    if (finance.monthKey === currentMonthKey) {
      if (finance.type === "Receita" || finance.type === "income") balance += finance.value;
      else balance -= finance.value;
    }
  });

  const balanceElement = document.getElementById("financeBalance");
  if (balanceElement) {
    balanceElement.textContent = formatMoney(balance);
    balanceElement.style.color = balance >= 0 ? "var(--text-white)" : "var(--danger)";
  }
}

function updateCurrentMonthTitle() {
  const title = document.getElementById("currentMonthTitle");
  if (!title) return;
  const today = new Date();
  title.textContent = `📄 Últimos Lançamentos (${getMonthName(today.getMonth())} / ${today.getFullYear()})`;
}

/* ----------------------------------------------
   6. ATUALIZAÇÃO CENTRALIZADA
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
   7. DISPARO EVENTOS DOM
   (menu mobile agora é responsabilidade do menu.js, incluído no HTML
    antes deste arquivo)
-----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  loadFinances();
  updateAllFinanceViews();

  document.getElementById("monthFilter")?.addEventListener("change", renderMonthlyHistory);
  document.getElementById("toggleFinanceHistory")?.addEventListener("click", toggleFinanceHistory);

  document.getElementById("editFinanceCancelBtn")?.addEventListener("click", closeEditFinanceModal);
  document.getElementById("editFinanceSaveBtn")?.addEventListener("click", saveEditFinance);
  document.getElementById("editFinanceModal")?.addEventListener("click", (e) => {
    if (e.target.id === "editFinanceModal") closeEditFinanceModal();
  });
});