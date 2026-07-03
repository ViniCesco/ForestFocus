// ========================================
// CALENDÁRIO - FOREST FOCUS
// ========================================

// Data atual
const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Eventos
let events = JSON.parse(localStorage.getItem("forestCalendarEvents")) || [];

let selectedDate = today.toISOString().split("T")[0];

// ========================================
// ELEMENTOS
// ========================================

const toggleCalendar =
    document.getElementById("toggleCalendar");

const calendarContainer =
    document.getElementById("calendarContainer");

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

// ========================================
// MESES
// ========================================

const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

// ========================================
// INICIALIZAÇÃO
// ========================================

updateTodayCard();

updateSummaryCards();

eventDate.value = selectedDate;

generateCalendar();

renderEvents();


// ========================================
// BOTÕES
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

function formatDateBR(dateString) {

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;

}

// ========================================
// CARD HOJE
// ========================================

function updateTodayCard() {

    todayCard.textContent = today.toLocaleDateString("pt-BR");

}
// 

function updateSummaryCards() {

    // Eventos do mês atual
    const monthCount = events.filter(event => {

        const date = new Date(event.date + "T00:00");

        return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        );

    }).length;

    monthEvents.textContent = monthCount;

    // Próximo evento
    const now = new Date();

    const upcoming = events
        .filter(event => new Date(event.date + "T" + (event.time || "23:59")) >= now)
        .sort((a, b) =>
            new Date(a.date + "T" + (a.time || "23:59")) -
            new Date(b.date + "T" + (b.time || "23:59"))
        );

    if (upcoming.length > 0) {

        nextEvent.textContent =
            `${upcoming[0].title} (${formatDateBR(upcoming[0].date)})`;

    } else {

        nextEvent.textContent = "Nenhum evento";

    }

}

// ========================================
// GERAR CALENDÁRIO
// ========================================

function generateCalendar() {

    calendarGrid.innerHTML = "";

    calendarTitle.textContent =
        `${months[currentMonth]} ${currentYear}`;

    const firstDay =
        new Date(currentYear, currentMonth, 1).getDay();

    const daysInMonth =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    const prevMonthDays =
        new Date(currentYear, currentMonth, 0).getDate();

    // =============================
    // MÊS ANTERIOR
    // =============================

    for (let i = firstDay; i > 0; i--) {

        const day = document.createElement("div");

        day.className =
            "calendar-day calendar-other-month";

        day.innerHTML = `
            <div class="calendar-day-number">
                ${prevMonthDays - i + 1}
            </div>
        `;

        calendarGrid.appendChild(day);

    }

    // =============================
    // MÊS ATUAL
    // =============================

    for (let i = 1; i <= daysInMonth; i++) {

        const day = document.createElement("div");

        day.className = "calendar-day";

        const fullDate =
            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

        day.dataset.date = fullDate;

        if (

            i === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()

        ) {

            day.classList.add("calendar-today");

        }

        day.innerHTML = `
            <div class="calendar-day-number">
                ${i}
            </div>

            <div class="event-dots"></div>
        `;

        // Destacar dia selecionado

        if (selectedDate === fullDate) {

            day.style.borderColor = "#22c55e";

        }

        // Clique

        day.addEventListener("click", () => {

            selectedDate = fullDate;

            eventDate.value = fullDate;

            generateCalendar();

            renderEvents();

        });

        // Bolinhas

        const dots = day.querySelector(".event-dots");

        const count = events.filter(e => e.date === fullDate).length;

        for (let j = 0; j < Math.min(count, 4); j++) {

            const dot = document.createElement("div");

            dot.className = "event-dot";

            dots.appendChild(dot);

        }

        calendarGrid.appendChild(day);

    }

    // =============================
    // PRÓXIMO MÊS
    // =============================

    while (calendarGrid.children.length < 42) {

        const day = document.createElement("div");

        day.className =
            "calendar-day calendar-other-month";

        day.innerHTML = `
            <div class="calendar-day-number">
                ${calendarGrid.children.length - (firstDay + daysInMonth) + 1}
            </div>
        `;

        calendarGrid.appendChild(day);

    }

}

// ========================================
// ADICIONAR EVENTO
// ========================================

// ========================================
// ADICIONAR / EDITAR EVENTO
// ========================================

function addEvent() {

    // Validação
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

    // =============================
    // EDITANDO EVENTO
    // =============================

    if (editingEventId !== null) {

        const event = events.find(e => e.id === editingEventId);

        if (event) {

            event.title = eventTitle.value;
            event.date = eventDate.value;
            event.time = eventTime.value;
            event.category = eventCategory.value;
            event.description = eventDescription.value;

        }

    }

    // =============================
    // NOVO EVENTO
    // =============================

    else {

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

    // Guarda se estava editando
    const wasEditing = editingEventId !== null;

    // =============================
    // SALVA
    // =============================

    localStorage.setItem(
        "forestCalendarEvents",
        JSON.stringify(events)
    );

    // Mensagem

    if (wasEditing) {

        alert("✅ Evento atualizado com sucesso!");

    } else {

        alert("✅ Evento adicionado com sucesso!");

    }

    // =============================
    // LIMPA FORMULÁRIO
    // =============================

    editingEventId = null;

    addEventButton.textContent = "+ Adicionar Evento";

    selectedDate = today.toISOString().split("T")[0];

    eventTitle.value = "";
    eventDate.value = selectedDate;
    eventTime.value = "";
    eventCategory.selectedIndex = 0;
    eventDescription.value = "";

    // =============================
    // ATUALIZA TELA
    // =============================

    generateCalendar();

    renderEvents();

    updateSummaryCards();

}

// ========================================
// RENDERIZA EVENTOS
// ========================================

function renderEvents() {

    selectedDateTitle.textContent =
    "📅 Eventos de " + formatDateBR(selectedDate);

    eventList.innerHTML = "";

    const dayEvents = events.filter(

        event => event.date === selectedDate

    );

    if (dayEvents.length === 0) {

        eventList.innerHTML = `

            <div class="empty-events">

                Nenhum evento para este dia.

            </div>

        `;

        return;

    }

    dayEvents.forEach(event => {

    eventList.innerHTML += `

    <div class="event-card ${event.completed ? "event-completed" : ""}">

        <h3>${event.title}</h3>

        <div class="event-info">

            🕒 ${event.time || "--:--"}

        </div>

        <div class="event-info">

            ${event.category || ""}

        </div>

        <div class="event-description">

            ${event.description || ""}

        </div>

        <div class="event-actions">

            <label>

                <input
                    type="checkbox"
                    ${event.completed ? "checked" : ""}
                    onchange="toggleEvent(${event.id})">

                Concluído

            </label>

            <div class="event-buttons">

            <button
                class="edit-btn"
                onclick="editEvent(${event.id})"
                title="Editar">

                ✏️

            </button>

            <button
                class="delete-btn"
                onclick="deleteEvent(${event.id})"
                title="Excluir">

                ❌

            </button>

        </div>

        </div>

    </div>

    `;

});

}

// ========================================
// EXCLUIR EVENTO
// ========================================

function deleteEvent(id){

    if(!confirm("Deseja realmente excluir este evento?")){

        return;

    }

    events = events.filter(e => e.id !== id);

    localStorage.setItem(
        "forestCalendarEvents",
        JSON.stringify(events)
    );

    generateCalendar();

    renderEvents();

    updateSummaryCards();

}

// ========================================
// CONCLUIR EVENTO
// ========================================

function toggleEvent(id){

    const event = events.find(e => e.id === id);

    if(!event) return;

    event.completed = !event.completed;

    localStorage.setItem(
        "forestCalendarEvents",
        JSON.stringify(events)
    );

    generateCalendar();

    renderEvents();

    updateSummaryCards();

}

let editingEventId = null;

function editEvent(id){

    const event = events.find(e => e.id === id);

    if(!event) return;

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