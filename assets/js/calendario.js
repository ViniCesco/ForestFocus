// ========================================
// 1. CONFIGURAÇÕES E SINALIZADORES GLOBAIS
// ========================================
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = today.toISOString().split("T")[0];

let events = JSON.parse(localStorage.getItem("forestCalendarEvents")) || [];

let editingEventId = null;
let pendingDeleteEventId = null;

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
const eventFormError = document.getElementById("eventFormError");

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
if (eventDate) eventDate.value = selectedDate;
generateCalendar();
renderEvents();

// ========================================
// 4. OUVINTES DE EVENTOS (LISTENERS)
// ========================================
prevMonthBtn?.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
});

nextMonthBtn?.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
});

todayBtn?.addEventListener("click", () => {
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    selectedDate = today.toISOString().split("T")[0];
    if (eventDate) eventDate.value = selectedDate;
    generateCalendar();
    renderEvents();
});

addEventButton?.addEventListener("click", addEvent);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("eventEditCancelBtn")?.addEventListener("click", closeEventEditModal);
    document.getElementById("eventEditSaveBtn")?.addEventListener("click", saveEventEdit);
    document.getElementById("eventEditModal")?.addEventListener("click", (e) => {
        if (e.target.id === "eventEditModal") closeEventEditModal();
    });

    document.getElementById("eventDeleteCancelBtn")?.addEventListener("click", closeEventDeleteModal);
    document.getElementById("eventDeleteConfirmBtn")?.addEventListener("click", confirmDeleteEvent);
    document.getElementById("eventDeleteModal")?.addEventListener("click", (e) => {
        if (e.target.id === "eventDeleteModal") closeEventDeleteModal();
    });
});

window.toggleEvent = toggleEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

// ========================================
// 5. FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ========================================
function formatDateBR(dateString) {
    if (!dateString) return "--/--/----";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function updateTodayCard() {
    if (todayCard) todayCard.textContent = today.toLocaleDateString("pt-BR");
}

// ========================================
// 6. ATUALIZAÇÃO DOS CARDS DE RESUMO
// ========================================
function updateSummaryCards() {
    const monthCount = events.filter(event => {
        if (!event.date) return false;
        const [y, m, d] = event.date.split("-");
        const date = new Date(y, m - 1, d);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    if (monthEvents) monthEvents.textContent = monthCount;

    const todayStr = today.toISOString().split("T")[0];
    const currentTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const upcoming = events.filter(e => {
        return e.date > todayStr || (e.date === todayStr && (e.time || "23:59") >= currentTimeStr);
    });

    if (upcoming.length > 0) {
        upcoming.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "23:59").localeCompare(b.time || "23:59"));
        if (nextEvent) nextEvent.textContent = `${upcoming[0].title} (${formatDateBR(upcoming[0].date)})`;
    } else {
        if (nextEvent) nextEvent.textContent = "Nenhum evento";
    }
}

// ========================================
// 7. RENDERIZAÇÃO DO CALENDÁRIO (DIAS)
// ========================================
function generateCalendar() {
    if (!calendarGrid || !calendarTitle) return;
    calendarGrid.innerHTML = "";
    calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = firstDay; i > 0; i--) {
        const day = document.createElement("div");
        day.className = "calendar-day other-month";
        day.textContent = prevMonthDays - i + 1;
        calendarGrid.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.className = "calendar-day";
        day.textContent = i;

        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        day.dataset.date = fullDate;

        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            day.classList.add("today");
        }

        const hasEvent = events.some(e => e.date === fullDate);
        if (hasEvent) {
            day.classList.add("has-event");
        }

        if (selectedDate === fullDate) {
            day.classList.add("selected");
        }

        day.addEventListener("click", () => {
            selectedDate = fullDate;
            if (eventDate) eventDate.value = fullDate;
            generateCalendar();
            renderEvents();
        });

        calendarGrid.appendChild(day);
    }

    let nextMonthDayCounter = 1;
    while (calendarGrid.children.length < 42) {
        const day = document.createElement("div");
        day.className = "calendar-day other-month";
        day.textContent = nextMonthDayCounter++;
        calendarGrid.appendChild(day);
    }
}

// ========================================
// 8. GERENCIAMENTO DE EVENTOS (CRUD)
// ========================================

function addEvent() {
    if (!eventTitle.value.trim()) {
        if (eventFormError) eventFormError.textContent = "Digite um título.";
        eventTitle.focus();
        return;
    }

    if (!eventDate.value) {
        if (eventFormError) eventFormError.textContent = "Escolha uma data.";
        eventDate.focus();
        return;
    }

    if (eventFormError) eventFormError.textContent = "";

    events.push({
        id: Date.now(),
        title: eventTitle.value.trim(),
        date: eventDate.value,
        time: eventTime.value || "00:00",
        category: eventCategory.value === "Categoria" ? "📌 Outros" : eventCategory.value,
        description: eventDescription.value.trim(),
        completed: false
    });

    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    eventTitle.value = "";
    eventTime.value = "";
    eventCategory.selectedIndex = 0;
    eventDescription.value = "";

    generateCalendar();
    renderEvents();
    updateSummaryCards();
}

function renderEvents() {
    if (!eventList || !selectedDateTitle) return;
    selectedDateTitle.textContent = "📅 Eventos de " + formatDateBR(selectedDate);
    eventList.innerHTML = "";

    const dayEvents = events.filter(event => event.date === selectedDate);

    if (dayEvents.length === 0) {
        eventList.innerHTML = `<div class="meta-empty">Nenhum evento agendado para este dia.</div>`;
        return;
    }

    dayEvents.forEach(event => {
        const item = document.createElement("div");
        item.className = "event-item" + (event.completed ? " completed" : "");

        item.innerHTML = `
            <div class="event-info">
                <span class="event-title ${event.completed ? "completed" : ""}">
                    ${event.category} - ${event.title}
                </span>
                <span class="event-details">
                    ⏰ ${event.time} ${event.description ? `• 📝 ${event.description}` : ""}
                </span>
                <label class="event-checkbox-label">
                    <input type="checkbox" ${event.completed ? "checked" : ""} onchange="toggleEvent(${event.id})"> Concluído
                </label>
            </div>
            <div class="event-actions">
                <button class="btn-action btn-edit" onclick="editEvent(${event.id})" title="Editar">📝</button>
                <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})" title="Excluir">🗑️</button>
            </div>
        `;
        eventList.appendChild(item);
    });
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    editingEventId = id;

    const modal = document.getElementById("eventEditModal");
    const titleInput = document.getElementById("eventEditTitle");
    const timeInput = document.getElementById("eventEditTime");
    const categorySelect = document.getElementById("eventEditCategory");
    const descInput = document.getElementById("eventEditDescription");
    const error = document.getElementById("eventEditError");
    if (!modal || !titleInput) return;

    titleInput.value = event.title;
    timeInput.value = event.time || "00:00";
    descInput.value = event.description || "";

    const matchingOption = [...categorySelect.options].find(opt => opt.value === event.category);
    categorySelect.value = matchingOption ? event.category : categorySelect.options[0].value;

    if (error) error.textContent = "";
    modal.classList.add("active");
    titleInput.focus();
}

function closeEventEditModal() {
    document.getElementById("eventEditModal")?.classList.remove("active");
    editingEventId = null;
}

function saveEventEdit() {
    const titleInput = document.getElementById("eventEditTitle");
    const timeInput = document.getElementById("eventEditTime");
    const categorySelect = document.getElementById("eventEditCategory");
    const descInput = document.getElementById("eventEditDescription");
    const error = document.getElementById("eventEditError");
    if (!titleInput || editingEventId === null) return;

    const newTitle = titleInput.value.trim();
    if (newTitle === "") {
        if (error) error.textContent = "O título não pode ficar vazio.";
        return;
    }

    const event = events.find(e => e.id === editingEventId);
    if (!event) return;

    event.title = newTitle;
    event.time = timeInput.value.trim() || "00:00";
    event.category = categorySelect.value;
    event.description = descInput.value.trim();

    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    generateCalendar();
    renderEvents();
    updateSummaryCards();
    closeEventEditModal();
}

function deleteEvent(id) {
    pendingDeleteEventId = id;
    document.getElementById("eventDeleteModal")?.classList.add("active");
}

function closeEventDeleteModal() {
    document.getElementById("eventDeleteModal")?.classList.remove("active");
    pendingDeleteEventId = null;
}

function confirmDeleteEvent() {
    if (pendingDeleteEventId === null) return;

    events = events.filter(e => e.id !== pendingDeleteEventId);
    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    generateCalendar();
    renderEvents();
    updateSummaryCards();
    closeEventDeleteModal();
}

function toggleEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    event.completed = !event.completed;
    localStorage.setItem("forestCalendarEvents", JSON.stringify(events));

    generateCalendar();
    renderEvents();
    updateSummaryCards();
}