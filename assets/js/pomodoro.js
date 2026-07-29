// ========================================
// 1. CONFIGURAÇÕES E SINALIZADORES GLOBAIS
// ========================================
const POMODORO_MINUTES = 25;
const TOTAL_SECONDS = POMODORO_MINUTES * 60;

let remainingSeconds = TOTAL_SECONDS;
let timerInterval = null;
let isRunning = false;

// ========================================
// 2. MAPEAMENTO DE ELEMENTOS DO DOM
// ========================================
const timer = document.getElementById("timer");
const toggleButton = document.getElementById("toggleTimerButton");
const resetButton = document.getElementById("resetPomodoro");

const progressBar = document.getElementById("pomodoroProgress");
const progressText = document.getElementById("progressPercent");
const focusTime = document.getElementById("focusTime");

const athenaImage = document.getElementById("athenaImage");
const athenaStage = document.getElementById("athenaStage");
const athenaMessage = document.getElementById("athenaMessage");

const infoButton = document.querySelector(".pomodoro-info-toggle");
const infoContent = document.querySelector(".pomodoro-info-content");
const infoArrow = document.querySelector(".info-arrow");

const musicButton = document.getElementById("musicButton");
const musicPanel = document.getElementById("musicPanel");
const closeMusic = document.getElementById("closeMusic");

// ========================================
// 3. INICIALIZAÇÃO DO SISTEMA
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    updateTimer();
    updateProgress();
    updateAthena();
    loadFocusTime();
    initInterfaceListeners();
});

// ========================================
// 4. OUVINTES DE EVENTOS (LISTENERS)
// ========================================
if (toggleButton) toggleButton.addEventListener("click", toggleTimer);
if (resetButton) resetButton.addEventListener("click", resetPomodoro);

document.addEventListener("keydown", (event) => {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();
        toggleTimer();
    }
});

function initInterfaceListeners() {
    if (infoButton && infoContent) {
        infoContent.style.display = "none";
        infoButton.addEventListener("click", () => {
            if (infoContent.style.display === "none") {
                infoContent.style.display = "flex";
                if (infoArrow) infoArrow.style.transform = "rotate(180deg)";
            } else {
                infoContent.style.display = "none";
                if (infoArrow) infoArrow.style.transform = "rotate(0deg)";
            }
        });
    }

    if (musicButton && musicPanel) {
        musicButton.addEventListener("click", () => {
            musicPanel.style.display = (musicPanel.style.display === "block") ? "none" : "block";
        });
    }

    if (closeMusic && musicPanel) {
        closeMusic.addEventListener("click", () => {
            musicPanel.style.display = "none";
        });
    }
}

// ========================================
// 5. FUNÇÕES AUXILIARES E SINTETIZADOR DE ÁUDIO
// ========================================
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function todayKey() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function tocarSomFimCronograma() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        
        const osc1 = context.createOscillator();
        const gain1 = context.createGain();
        osc1.type = 'triangle';
        osc1.frequency.value = 523.25;
        
        osc1.connect(gain1);
        gain1.connect(context.destination);
        osc1.start(context.currentTime);
        gain1.gain.setValueAtTime(0.5, context.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2); 
        osc1.stop(context.currentTime + 0.2);

        const tempoNota2 = context.currentTime + 0.15;
        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = 659.25;
        
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.start(tempoNota2);
        gain2.gain.setValueAtTime(0.5, tempoNota2);
        gain2.gain.exponentialRampToValueAtTime(0.001, tempoNota2 + 0.35);
        osc2.stop(tempoNota2 + 0.35);
    } catch (e) {
        console.error("AudioContext não suportado ou bloqueado.", e);
    }
}

// ========================================
// 6. ATUALIZAÇÃO DE COMPONENTES VISUAIS (CARDS / METRICS)
// ========================================
function updateTimer() {
    if (timer) timer.textContent = formatTime(remainingSeconds);
}

function updateProgress() {
    if (!progressBar || !progressText) return;
    const progress = ((TOTAL_SECONDS - remainingSeconds) / TOTAL_SECONDS) * 100;
    
    progressBar.style.width = progress + "%";
    progressText.textContent = Math.round(progress) + "%";
}

function updateAthena() {
    if (!athenaImage || !athenaStage || !athenaMessage) return;
    
    const progress = ((TOTAL_SECONDS - remainingSeconds) / TOTAL_SECONDS) * 100;

    if (progress < 40) {
        athenaImage.src = "../assets/img/athena/athena_inicio.png";
        athenaStage.textContent = "Estágio 1 de 3";
        athenaMessage.textContent = "Vamos começar uma nova sessão de foco?";
    } else if (progress < 80) {
        athenaImage.src = "../assets/img/athena/athena_meio.png";
        athenaStage.textContent = "Estágio 2 de 3";
        athenaMessage.textContent = (progress < 60) 
            ? "Ótimo trabalho! Continue nesse ritmo." 
            : "Excelente! Já passamos da metade.";
    } else {
        athenaImage.src = "../assets/img/athena/athena_fim.png";
        athenaStage.textContent = "Estágio 3 de 3";
        athenaMessage.textContent = (progress < 100) 
            ? "Estamos quase lá! Continue firme." 
            : "Parabéns! Você concluiu mais uma sessão.";
    }
}

// ========================================
// 7. RENDERIZAÇÃO DO TEMPO FOCADO ACUMULADO
// ========================================
function showFocusTime(minutes) {
    if (!focusTime) return;

    if (minutes < 60) {
        focusTime.textContent = minutes + " minutos";
        return;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    focusTime.textContent = (mins === 0) 
        ? hours + "h" 
        : `${hours}h ${mins}min`;
}

// ========================================
// 8. GERENCIAMENTO DAS REGRAS DE NEGÓCIO (TIMER CORE / LOCALSTORAGE)
// ========================================
function toggleTimer() {
    if (isRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function updateToggleButton() {
    if (!toggleButton) return;

    if (isRunning) {
        toggleButton.textContent = "⏸ Pausar";
        toggleButton.classList.add("is-running");
    } else {
        toggleButton.textContent = "▶ Iniciar";
        toggleButton.classList.remove("is-running");
    }
}

function startPomodoro() {
    if (isRunning) return;
    isRunning = true;
    updateToggleButton();

    timerInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds <= 0) {
            finishPomodoro();
        } else {
            updateTimer();
            updateProgress();
            updateAthena();
        }
    }, 1000);
}

function pausePomodoro() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    updateToggleButton();
}

function resetPomodoro() {
    pausePomodoro();
    remainingSeconds = TOTAL_SECONDS;
    updateTimer();
    updateProgress();
    updateAthena();
}

function finishPomodoro() {
    pausePomodoro();
    remainingSeconds = 0;
    
    updateTimer();
    updateProgress();
    updateAthena();
    addFocusTime(POMODORO_MINUTES);

    tocarSomFimCronograma();

    setTimeout(() => {
        alert("🏆 Parabéns! Sessão concluída!\n\nAgora faça uma pausa de 5 minutos antes de iniciar um novo Pomodoro.");
    }, 100);
}

function checkNewDay() {
    const savedDate = localStorage.getItem("pomodoroDate");
    const todayStr = todayKey();

    if (savedDate !== todayStr) {
        localStorage.setItem("pomodoroDate", todayStr);
        localStorage.setItem("pomodoroFocusTime", "0");
    }
}

function loadFocusTime() {
    checkNewDay();
    const minutes = parseInt(localStorage.getItem("pomodoroFocusTime") || "0");
    showFocusTime(minutes);
}

function addFocusTime(minutes) {
    checkNewDay();
    let total = parseInt(localStorage.getItem("pomodoroFocusTime") || "0");
    total += minutes;
    
    localStorage.setItem("pomodoroFocusTime", total);
    showFocusTime(total);
}