document.addEventListener("DOMContentLoaded", () => {

    const athenaBtn = document.getElementById("athenaAssistantBtn");
    const athenaCard = document.getElementById("athenaSummaryCard");
    const closeSummaryBtn = document.getElementById("closeSummaryBtn");
    const summaryText = document.getElementById("summaryText");

    if (athenaBtn && athenaCard) {
        athenaBtn.addEventListener("click", () => {
            if (
                athenaCard.style.display === "none" ||
                athenaCard.style.display === ""
            ) {
                gerarResumoDiario();
                athenaCard.style.display = "block";
            } else {
                athenaCard.style.display = "none";
            }
        });
    }

    if (closeSummaryBtn) {
        closeSummaryBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            athenaCard.style.display = "none";
        });
    }

    function gerarResumoDiario() {

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const pendingTasks = tasks.filter(task => !(task.completed || task.concluida)).length;

        const focusMinutes = parseInt(localStorage.getItem("pomodoroFocusTime")) || 0;

        const plantProgress = parseInt(localStorage.getItem("currentPlantProgress")) || 0;

        const totalTrees = parseInt(localStorage.getItem("forestTrees")) || 0;

        const events = JSON.parse(localStorage.getItem("forestCalendarEvents")) || [];
        
        let nextEvent = `📅 <b>Próximo evento</b><br>Nenhum evento agendado<br>`;

        if (events.length > 0) {
            const agora = new Date();
            
            const futuros = events
                .filter(event => {
                    if (!event.date) return false;
                    const dataStr = event.date.trim();
                    const dataTratada = dataStr.length === 10 ? dataStr.replace(/-/g, '/') : dataStr;
                    return new Date(dataTratada) >= agora;
                })
                .sort((a, b) => {
                    const dataA = (a.date || "").trim().length === 10 ? a.date.trim().replace(/-/g, '/') : (a.date || "");
                    const dataB = (b.date || "").trim().length === 10 ? b.date.trim().replace(/-/g, '/') : (b.date || "");
                    return new Date(dataA) - new Date(dataB);
                });

            if (futuros.length > 0) {
                const evento = futuros[0];
                const dataOriginalStr = (evento.date || "").trim();
                
                const temHorarioSalvo = dataOriginalStr.length > 10;
                const dataTratada = !temHorarioSalvo ? dataOriginalStr.replace(/-/g, '/') : dataOriginalStr;
                const data = new Date(dataTratada);

                const dataFormatada = data.toLocaleDateString("pt-BR");
                
                let linhaHora = "";
                if (temHorarioSalvo) {
                    const horaFormatada = data.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    linhaHora = `🕓 ${horaFormatada}<br>`;
                }

                nextEvent = `
📅 <b>Próximo evento</b><br>
📌 ${evento.title || evento.name}<br>
🗓 ${dataFormatada}<br>
${linhaHora}`;
            }
        }

        const moodArchive = JSON.parse(localStorage.getItem("forestMoodArchive")) || [];
        let energia = "";

        if (moodArchive.length > 0) {
            const ultimo = moodArchive[moodArchive.length - 1];
            energia = ultimo.mood || ultimo.energia || ultimo.status || "";
        }

        const finances = JSON.parse(localStorage.getItem("finances")) || [];
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        let balance = 0;

        finances.forEach(item => {
            if (!item.date) return;

            const data = new Date(item.date);
            if (data.getMonth() !== mesAtual || data.getFullYear() !== anoAtual) {
                return;
            }

            const valor = Number(item.amount || item.value || item.valor || 0);

            if (item.type === "income" || item.type === "entrada") {
                balance += valor;
            } else {
                balance -= valor;
            }
        });

        const balanceFormatado = balance.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const hora = hoje.getHours();
        let saudacao = "Olá, Explorador!";

        if (hora < 12) {
            saudacao = "🌞 Bom dia, Explorador!";
        } else if (hora < 18) {
            saudacao = "☀️ Boa tarde, Explorador!";
        } else {
            saudacao = "🌙 Boa noite, Explorador!";
        }

        const frasesDoMes = [
            "Continue evoluindo um pequeno passo por vez.", // Dia 1
            "Grandes florestas crescem a partir de pequenas sementes.", // Dia 2
            "O foco de hoje é o resultado de amanhã.", // Dia 3
            "Sua consistência é o seu superpoder.", // Dia 4
            "Feito é melhor que perfeito. Continue avançando!", // Dia 5
            "Cada minuto de foco conta para a sua jornada.", // Dia 6
            "Cultive bons hábitos e colha grandes conquistas.", // Dia 7
            "A paciência e a persistência transformam esforço em progresso.", // Dia 8
            "Você é o arquiteto da sua própria rotina.", // Dia 9
            "Acredite no processo, a evolução nem sempre é linear.", // Dia 10
            "Um dia produtivo começa com pequenas escolhas conscientes.", // Dia 11
            "Respire fundo, organize suas ideias e dê o próximo passo.", // Dia 12
            "Suba os degraus de hoje com orgulho do caminho até aqui.", // Dia 13
            "Mantenha a mente firme e a meta clara.", // Dia 14
            "Seu foco determina a sua realidade.", // Dia 15
            "O segredo do sucesso é a constância no propósito.", // Dia 16
            "Celebre as pequenas vitórias da sua rotina diária.", // Dia 17
            "O esforço de hoje constrói a sua liberdade de amanhã.", // Dia 18
            "Sua mente é como um jardim: cultive pensamentos focados.", // Dia 19
            "Gerencie seu tempo, proteja sua energia.", // Dia 20
            "O progresso lento ainda é progresso. Não pare!", // Dia 21
            "Foque no que você pode controlar hoje.", // Dia 22
            "Sua dedicação atual está regando o seu futuro.", // Dia 23
            "Transforme a disciplina em sua maior aliada.", // Dia 24
            "Mais um dia para se aproximar dos seus objetivos.", // Dia 25
            "A clareza mental vem da organização das suas tarefas.", // Dia 26
            "Persista! O topo da montanha tem a melhor vista.", // Dia 27
            "Dê o seu melhor com as ferramentas que você tem agora.", // Dia 28
            "Cada escolha de foco afasta você da distração.", // Dia 29
            "A consistência silenciosa gera resultados barulhentos.", // Dia 30
            "Olhe para trás e veja o quanto sua floresta já cresceu!" // Dia 31
        ];

        const diaDoMes = hoje.getDate();
        const fraseDoDia = frasesDoMes[diaDoMes - 1] || frasesDoMes[0];

        let resumo = `
${saudacao}<br><br>
📋 <b>Tarefas pendentes:</b> ${pendingTasks}<br>
🍅 <b>Tempo focado hoje:</b> ${focusMinutes} min<br>
🌱 <b>Progresso da planta:</b> ${plantProgress}%<br>
🌳 <b>Árvores cultivadas:</b> ${totalTrees}<br>
🪙 <b>Saldo:</b> ${balanceFormatado}<br>
<hr style="border:none; border-top:1px solid rgba(255,255,255,.12); margin:12px 0;">
${nextEvent}
`;

        if (energia !== "") {
            resumo += `⚡ <b>Energia:</b> ${energia}<br>`;
        }

        resumo += `
<hr style="border:none; border-top:1px solid rgba(255,255,255,.12); margin:12px 0;">
💚 ${fraseDoDia}
`;

        if (summaryText) {
            summaryText.innerHTML = resumo;
        }
    }

    window.addEventListener("storage", () => {
        if (
            athenaCard &&
            athenaCard.style.display === "block"
        ) {
            gerarResumoDiario();
        }
    });

});