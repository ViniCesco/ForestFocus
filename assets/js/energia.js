// ========================================
// 1. CONFIGURAÇÕES E SINALIZADORES GLOBAIS
// ========================================
document.addEventListener("DOMContentLoaded", () => {

    let moodLogs = JSON.parse(localStorage.getItem("forestMoodLogs")) || [];
    let archivedMonths = JSON.parse(localStorage.getItem("forestMoodArchive")) || {};
    let selectedMood = null;
    let isCurrentExpanded = false;
    let isArchiveExpanded = false;

    // ========================================
    // 2. MAPEAMENTO DE ELEMENTOS DO DOM
    // ========================================
    const moodButtons = document.querySelectorAll(".mood-btn");
    const moodNoteInput = document.getElementById("moodNote");
    const saveMoodButton = document.getElementById("saveMoodButton");
    const moodError = document.getElementById("moodError");
    const currentMonthHeader = document.getElementById("currentMonthHeader");
    const currentMonthList = document.getElementById("currentMonthList");
    const archivedMonthList = document.getElementById("archivedMonthList");
    const moodChartContainer = document.getElementById("moodChartContainer");
    const monthFilter = document.getElementById("monthFilter");

    const moodConfig = {
        "Energia Máxima": {
            emoji: "🚀",
            class: "bar-maxima"
        },
        "Muita Energia": {
            emoji: "⚡",
            class: "bar-alta"
        },
        "Energia Normal": {
            emoji: "😊",
            class: "bar-normal"
        },
        "Pouca Energia": {
            emoji: "😐",
            class: "bar-baixa"
        },
        "Muito Cansado": {
            emoji: "😵",
            class: "bar-cansado"
        },
        "Sem Energia": {
            emoji: "💤",
            class: "bar-sem-energia"
        }
    };

    const monthNames = {
        "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
        "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
        "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };

    // ========================================
    // 3. FUNÇÕES AUXILIARES DE DATA E ARQUIVO
    // ========================================
    const getLocalDateStr = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getCurrentMonthKey = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    function formatMonthLabel(key) {
        if (!key) return "";
        const [year, month] = key.split("-");
        return `${monthNames[month] || month} ${year}`;
    }

    function checkAndArchivePreviousMonths() {
        const currentMonth = getCurrentMonthKey();
        const pastLogs = moodLogs.filter(log => !log.date.startsWith(currentMonth));

        if (pastLogs.length > 0) {
            pastLogs.forEach(log => {
                const logMonth = log.date.substring(0, 7);
                if (!archivedMonths[logMonth]) {
                    archivedMonths[logMonth] = [];
                }
                if (!archivedMonths[logMonth].some(item => item.date === log.date)) {
                    archivedMonths[logMonth].push(log);
                }
            });

            moodLogs = moodLogs.filter(log => log.date.startsWith(currentMonth));
            localStorage.setItem("forestMoodLogs", JSON.stringify(moodLogs));
            localStorage.setItem("forestMoodArchive", JSON.stringify(archivedMonths));
        }
    }

    function updateFilterOptions() {
        if (!monthFilter) return;
        const currentSelected = monthFilter.value;
        monthFilter.innerHTML = '<option value="">Selecione um mês anterior...</option>';

        Object.keys(archivedMonths).sort().reverse().forEach(key => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = formatMonthLabel(key);
            monthFilter.appendChild(option);
        });

        monthFilter.value = currentSelected;
    }
    
    function deleteMoodLog(date, monthKey) {
        if (monthKey) {
            archivedMonths[monthKey] = (archivedMonths[monthKey] || []).filter(l => l.date !== date);
            localStorage.setItem("forestMoodArchive", JSON.stringify(archivedMonths));
        } else {
            moodLogs = moodLogs.filter(l => l.date !== date);
            localStorage.setItem("forestMoodLogs", JSON.stringify(moodLogs));
        }
        updateAnalytics();
    }

    // ========================================
    // 4. RENDERIZAÇÃO DE COMPONENTES VISUAIS
    // ========================================
    function createHistoryItem(log, monthKey) {
        const parts = log.date.split("-");
        const day = parts[2] || "00";
        const month = parts[1] || "00";
        const config = moodConfig[log.mood] || { emoji: "📝" };

        const item = document.createElement("div");
        item.className = "mood-log-item";
        item.innerHTML = `
            <div class="mood-log-meta">
                <span class="mood-log-title">${config.emoji} ${log.mood}</span>
                ${log.note ? `<span class="mood-log-note">"${log.note}"</span>` : ""}
            </div>
            <div class="mood-log-aside">
                <span class="mood-log-date">${day}/${month}</span>
                <button class="mood-log-delete" title="Excluir registro">🗑️</button>
            </div>
        `;

        item.querySelector(".mood-log-delete")?.addEventListener("click", () => {
            deleteMoodLog(log.date, monthKey);
        });

        return item;
    }

    function createToggleTemplate(isExpandedState, onClickCallback) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "today-btn-alt";
        toggleBtn.style.width = "100%";
        toggleBtn.style.marginTop = "15px";
        toggleBtn.textContent = isExpandedState ? "▲ Mostrar menos" : "▼ Mostrar mais";
        toggleBtn.addEventListener("click", onClickCallback);
        return toggleBtn;
    }

    function renderArchiveList() {
        if (!archivedMonthList || !monthFilter) return;
        archivedMonthList.innerHTML = "";

        const selectedPeriod = monthFilter.value;
        if (!selectedPeriod) return;

        const archiveLogs = archivedMonths[selectedPeriod] || [];

        if (archiveLogs.length === 0) {
            archivedMonthList.innerHTML = `<div class="energy-empty">Nenhum registro encontrado.</div>`;
            return;
        }

        const logsToRender = isArchiveExpanded ? archiveLogs : archiveLogs.slice(0, 3);
        logsToRender.forEach(log => {
            archivedMonthList.appendChild(createHistoryItem(log, selectedPeriod));
        });

        if (archiveLogs.length > 3) {
            const btn = createToggleTemplate(isArchiveExpanded, () => {
                isArchiveExpanded = !isArchiveExpanded;
                renderArchiveList();
            });
            archivedMonthList.appendChild(btn);
        }
    }

    function updateAnalytics() {
        checkAndArchivePreviousMonths();
        updateFilterOptions();
        renderArchiveList();

        if (currentMonthHeader) {
            currentMonthHeader.textContent = `📋 Lançamentos de ${formatMonthLabel(getCurrentMonthKey())}`;
        }

        if (currentMonthList) {
            currentMonthList.innerHTML = "";
            if (moodLogs.length === 0) {
                currentMonthList.innerHTML = `<div class="energy-empty">Nenhum registro feito neste mês ainda.</div>`;
            } else {
                const logsToRender = isCurrentExpanded ? moodLogs : moodLogs.slice(0, 3);

                logsToRender.forEach(log => {
                    currentMonthList.appendChild(createHistoryItem(log, null));
                });

                if (moodLogs.length > 3) {
                    const btn = createToggleTemplate(isCurrentExpanded, () => {
                        isCurrentExpanded = !isCurrentExpanded;
                        updateAnalytics();
                    });
                    currentMonthList.appendChild(btn);
                }
            }
        }

        const counts = {
            "Energia Máxima": 0,
            "Muita Energia": 0,
            "Energia Normal": 0,
            "Pouca Energia": 0,
            "Muito Cansado": 0,
            "Sem Energia": 0
        };

        let totalRecords = moodLogs.length;

        moodLogs.forEach(log => {
            if (counts[log.mood] !== undefined) {
                counts[log.mood]++;
            }
        });

        if (moodChartContainer) {
            moodChartContainer.innerHTML = "";
            Object.keys(counts).forEach(moodName => {
                const count = counts[moodName];
                const percentage = totalRecords > 0 ? (count / totalRecords) * 100 : 0;
                const config = moodConfig[moodName];

                const row = document.createElement("div");
                row.className = "chart-row";
                row.innerHTML = `
                    <div class="chart-label">${config.emoji} ${moodName}</div>
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar-fill ${config.class || ''}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="chart-count">${count}x</div>
                `;
                moodChartContainer.appendChild(row);
            });
        }
    }

    // ========================================
    // 5. OUVINTES DE EVENTOS (LISTENERS)
    // ========================================
    moodButtons.forEach(button => {
        button.addEventListener("click", () => {
            moodButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedMood = button.dataset.mood;
            if (moodError) moodError.textContent = "";
        });
    });

    if (moodNoteInput && saveMoodButton) {
        moodNoteInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveMoodButton.click();
            }
        });
    }

    if (saveMoodButton) {
        saveMoodButton.addEventListener("click", () => {
            if (!selectedMood) {
                if (moodError) moodError.textContent = "Selecione um estado de energia antes de registrar.";
                return;
            }

            if (moodError) moodError.textContent = "";

            const todayStr = getLocalDateStr();
            moodLogs = moodLogs.filter(log => log.date !== todayStr);

            moodLogs.unshift({
                date: todayStr,
                mood: selectedMood,
                note: moodNoteInput ? moodNoteInput.value.trim() : ""
            });

            localStorage.setItem("forestMoodLogs", JSON.stringify(moodLogs));

            if (moodNoteInput) moodNoteInput.value = "";
            moodButtons.forEach(btn => btn.classList.remove("selected"));
            selectedMood = null;

            isCurrentExpanded = false;
            updateAnalytics();
        });
    }

    if (monthFilter) {
        monthFilter.addEventListener("change", () => {
            isArchiveExpanded = false;
            renderArchiveList();
        });
    }

    updateAnalytics();
});