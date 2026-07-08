document.addEventListener("DOMContentLoaded", () => {

    let moodLogs = JSON.parse(localStorage.getItem("forestMoodLogs")) || [];
    let archivedMonths = JSON.parse(localStorage.getItem("forestMoodArchive")) || {};
    let selectedMood = null;
    let isCurrentExpanded = false;
    let isArchiveExpanded = false;

    const moodButtons = document.querySelectorAll(".mood-btn");
    const moodNoteInput = document.getElementById("moodNote");
    const saveMoodButton = document.getElementById("saveMoodButton");
    const currentMonthHeader = document.getElementById("currentMonthHeader");
    const currentMonthList = document.getElementById("currentMonthList");
    const archivedMonthList = document.getElementById("archivedMonthList");
    const moodChartContainer = document.getElementById("moodChartContainer");
    const monthFilter = document.getElementById("monthFilter");
    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".menu-toggle");
    const mainContent = document.querySelector(".main-content");

    const moodConfig = {
        "Ultra Focado": { emoji: "⚡", class: "bar-ultra" },
        "Energia Alta": { emoji: "🔋", class: "bar-alta" },
        "Fadiga Mental": { emoji: "📉", class: "bar-fadiga" },
        "Bloqueio Criativo": { emoji: "🚫", class: "bar-bloqueio" },
        "Exaustão": { emoji: "💤", class: "bar-exaustao" }
    };

    const monthNames = {
        "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
        "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
        "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };

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

    function createHistoryItemHTML(log) {
        const parts = log.date.split("-");
        const day = parts[2] || "00";
        const month = parts[1] || "00";
        const config = moodConfig[log.mood] || { emoji: "📝" };
        
        return `
            <div class="mood-history-main">
                <span style="font-size: 20px;">${config.emoji}</span>
                <div>
                    <div class="mood-history-status">${log.mood}</div>
                    ${log.note ? `<div class="mood-history-note">"${log.note}"</div>` : ""}
                </div>
            </div>
            <div class="mood-history-date">${day}/${month}</div>
        `;
    }

    function createToggleTemplate(isExpandedState, onClickCallback) {
        const toggleBtn = document.createElement("button");
        toggleBtn.style.cssText = "width:100%; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:6px; color:#a0aec0; font-size:14px; cursor:pointer; margin-top:15px; transition:background 0.2s;";
        toggleBtn.textContent = isExpandedState ? "▲ Mostrar menos" : "▼ Mostrar mais";
        
        toggleBtn.addEventListener("mouseenter", () => toggleBtn.style.background = "rgba(255,255,255,0.05)");
        toggleBtn.addEventListener("mouseleave", () => toggleBtn.style.background = "rgba(255,255,255,0.02)");
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
            archivedMonthList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum registro encontrado.</div>`;
            return;
        }

        const logsToRender = isArchiveExpanded ? archiveLogs : archiveLogs.slice(0, 3);
        logsToRender.forEach(log => {
            const item = document.createElement("div");
            item.className = "mood-history-item";
            item.innerHTML = createHistoryItemHTML(log);
            archivedMonthList.appendChild(item);
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
                currentMonthList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum registro feito neste mês ainda.</div>`;
            } else {
                const logsToRender = isCurrentExpanded ? moodLogs : moodLogs.slice(0, 3);

                logsToRender.forEach(log => {
                    const item = document.createElement("div");
                    item.className = "mood-history-item";
                    item.innerHTML = createHistoryItemHTML(log);
                    currentMonthList.appendChild(item);
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

        const counts = { "Ultra Focado": 0, "Energia Alta": 0, "Fadiga Mental": 0, "Bloqueio Criativo": 0, "Exaustão": 0 };
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
                    <div class="chart-label-zone">
                        <span>${config.emoji} ${moodName}</span>
                        <strong>${count}x</strong>
                    </div>
                    <div class="chart-bar-bg">
                        <div class="chart-bar-fill ${config.class}" style="width: ${percentage}%"></div>
                    </div>
                `;
                moodChartContainer.appendChild(row);
            });
        }
    }

    moodButtons.forEach(button => {
        button.addEventListener("click", () => {
            moodButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedMood = button.dataset.mood;
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
                alert("Por favor, selecione um estado de energia antes de registrar.");
                return;
            }

            const todayStr = getLocalDateStr();
            moodLogs = moodLogs.filter(log => log.date !== todayStr);

            moodLogs.unshift({
                date: todayStr,
                mood: selectedMood,
                note: moodNoteInput ? moodNoteInput.value.trim() : ""
            });

            localStorage.setItem("forestMoodLogs", JSON.stringify(moodLogs));
            alert("✅ Estado de energia registrado!");
            
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

    if (menuButton && sidebar && mainContent) {
        menuButton.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            mainContent.classList.toggle("menu-expanded");
        });
    }

    updateAnalytics();
});