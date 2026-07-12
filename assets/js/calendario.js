// ========================================
// 1. CONFIGURAÇÕES E SINALIZADORES GLOBAIS
// ========================================
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = today.toISOString().split("T")[0];
let editingEventId = null; // Declarada corretamente no escopo global

// Carregar Eventos do LocalStorage
let events = JSON.parse(localStorage.getItem("forestCalendarEvents")) || [];

// ========================================
// 2. MAPEAMENTO DE ELEMENTOS DO DOM
// ========================================
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayButton");

const todayCard = document.getElementById("todayCard");
const monthEvents = document.getElementById("monthEvents");
const nextEvent = document.getElementById("nextEvent");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventCategory = document.getElementById("eventCategory");
const eventDescription = document.getElementById("eventDescription");

const addEventButton = document.getElementById("addEventButton");
const eventList = document.getElementById("eventList");
const selectedDateTitle = document.getElementById("selectedDateTitle");

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ========================================
// 3. INICIALIZAÇÃO DO SISTEMA
// ========================================
updateTodayCard();
updateSummaryCards();
eventDate.value = selectedDate;
generateCalendar();
renderEvents();

// ========================================
// 4. OUVINTES DE EVENTOS (LISTENERS)
// ========================================
prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
});

todayBtn.addEventListener("click", () => {
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    generateCalendar();
});

addEventButton.addEventListener("click", addEvent);

// Torna as funções globais para funcionarem com os atributos `onclick` e `onchange` do HTML dinâmico
window.toggleEvent = toggleEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

// ========================================
// 5. FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ========================================
function formatDateBR(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function updateTodayCard() {
    todayCard.textContent = today.toLocaleDateString("pt-BR");
}

// ========================================
// 6. ATUALIZAÇÃO DOS CARDS DE RESUMO
// ========================================
function updateSummaryCards() {
    // Eventos do mês atual
    const monthCount = events.filter(event => {
        const date = new Date(event.date + "T00:00");
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    monthEvents.textContent = monthCount;

    // Próximo evento pendente
    const now = new Date();
    const upcoming = events
        .filter(event => new Date(event.date + "T" + (event.time || "23:59")) >= now)
        .sort((a, b) => new Date(a.date + "T" + (a.time || "23:59")) - new Date(b.date + "T" + (b.time || "23:59")));

    if (upcoming.length > 0) {
        nextEvent.textContent = `${upcoming[0].title} (${formatDateBR(upcoming[0].date)})`;
    } else {
        nextEvent.textContent = "Nenhum evento";
    }
}

// ========================================
// 7. RENDERIZAÇÃO DO CALENDÁRIO (DIAS)
// ========================================
function generateCalendar() {
    calendarGrid.innerHTML = "";
    calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Mês Anterior (Dias opacos)
    for (let i = firstDay; i > 0; i--) {
        const day = document.createElement("div");
        day.className = "calendar-day calendar-other-month";
        day.innerHTML = `<div class="calendar-day-number">${prevMonthDays - i + 1}</div>`;
        calendarGrid.appendChild(day);
    }

    // Mês Atual
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.className = "calendar-day";

        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        day.dataset.date = fullDate;

        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            day.classList.add("calendar-today");
        }

        day.innerHTML = `
            <div class="calendar-day-number">${i}</div>
            <div class="event-dots"></div>
        `;

        // Destacar dia selecionado
        if (selectedDate === fullDate) {
            day.style.borderColor = "#22c55e";
        }

        // Evento de clique para selecionar o dia
        day.addEventListener("click", () => {
            selectedDate = fullDate;
            eventDate.value = fullDate;
            generateCalendar();
            renderEvents();
        });

        // Adicionar bolinhas indicadoras de eventos (Limite de 4)
        const dots = day.querySelector(".event-dots");
        const count = events.filter(e => e.date === fullDate).length;
        for (let j = 0; j < Math.min(count, 4); j++) {
            const dot = document.createElement("div");
            dot.className = "event-dot";
            dots.appendChild(dot);
        }

        calendarGrid.appendChild(day);
    }

    // Próximo Mês (Dias opacos para fechar a grade de 6 linhas / 42 blocos)
    while (calendarGrid.children.length < 42) {
        const day = document.createElement("div");
        day.className = "calendar-day calendar-other-month";
        day.innerHTML = `
            <div class="calendar-day-number">
                ${calendarGrid.children.length - (firstDay + daysInMonth) + 1}
            </div>
        `;
        calendarGrid.appendChild(day);
    }
}

// ========================================
// 8. GERENCIAMENTO DE EVENTOS (CRUD)
// ========================================

// Adicionar ou Atualizar Evento
function addEvent() {
    if (!eventTitle.value.trim()) {
        alert("Digite um título.");
        eventTitle.focus();
        return;
    }

    if (!eventDate.value) {
        alert("Escolha uma data.");
        eventDate.focus();
        return;
    }

    const wasEditing = editingEventId !== null;

    if (wasEditing) {
        const event = events.find(e => e.id === editingEventId);
        if (event) {
            event.title = eventTitle.value;
            event.date = eventDate.value;
            event.time = eventTime.value;
            event.category = eventCategory.value;
            event.description = eventDescription.value;
        }
    } else {
        events.push({
            id: Date.now(),
            title: eventTitle.value,
            date: eventDate.value,
            time: eventTime.value,
            category: eventCategory.value,
            description: eventDescription.value,
            completed: false
        });
    }

    // Salvar e Resetar Estado
    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));
    alert(wasEditing ? "✅ Evento atualizado com sucesso!" : "✅ Evento adicionado com sucesso!");

    editingEventId = null;
    addEventButton.textContent = "+ Adicionar Evento";
    
    // Limpar formulário
    eventTitle.value = "";
    eventTime.value = "";
    eventCategory.selectedIndex = 0;
    eventDescription.value = "";

    // Atualizar UI
    generateCalendar();
    renderEvents();
    updateSummaryCards();
}

// Renderizar Eventos do Dia Selecionado
function renderEvents() {
    selectedDateTitle.textContent = "📅 Eventos de " + formatDateBR(selectedDate);
    eventList.innerHTML = "";

    const dayEvents = events.filter(event => event.date === selectedDate);

    if (dayEvents.length === 0) {
        eventList.innerHTML = `<div class="empty-events">Nenhum evento para este dia.</div>`;
        return;
    }

    // Construção acumulada em string para evitar re-renderizações excessivas do DOM
    let listHTML = "";
    dayEvents.forEach(event => {
        listHTML += `
        <div class="event-card ${event.completed ? "event-completed" : ""}">
            <h3>${event.title}</h3>
            <div class="event-info">🕒 ${event.time || "--:--"}</div>
            <div class="event-info">${event.category || ""}</div>
            <div class="event-description">${event.description || ""}</div>
            <div class="event-actions">
                <label>
                    <input type="checkbox" ${event.completed ? "checked" : ""} onchange="toggleEvent(${event.id})">
                    Concluído
                </label>
                <div class="event-buttons">
                    <button class="edit-btn" onclick="editEvent(${event.id})" title="Editar">✏️</button>
                    <button class="delete-btn" onclick="deleteEvent(${event.id})" title="Excluir">❌</button>
                </div>
            </div>
        </div>
        `;
    });
    eventList.innerHTML = listHTML;
}

// Excluir Evento
function deleteEvent(id) {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    events = events.filter(e => e.id !== id);
    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    generateCalendar();
    renderEvents();
    updateSummaryCards();
}

// Alternar Estado de Conclusão
function toggleEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    event.completed = !event.completed;
    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    generateCalendar();
    renderEvents();
    updateSummaryCards();
}

// Iniciar Modo de Edição
function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    editingEventId = id;
    selectedDate = event.date;

    eventTitle.value = event.title;
    eventDate.value = event.date;
    eventTime.value = event.time;
    eventCategory.value = event.category;
    eventDescription.value = event.description;

    addEventButton.textContent = "💾 Salvar Alterações";

    generateCalendar();
    renderEvents();
    updateSummaryCards();
}

// ========================================
// 9. CONTROLE DA SIDEBAR RESPONSIVA
// ========================================
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