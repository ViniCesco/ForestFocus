    /*=========================================
        TEMA GLOBAL 
    =========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.querySelector(".theme-icon");

    /*=========================
        Carregar tema salvo
    =========================*/

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        body.classList.add("light-theme");
    }

    /*=========================
        Atualizar ícone
    =========================*/

    function updateIcon() {

        if (!themeIcon) return;

        themeIcon.textContent = body.classList.contains("light-theme")
            ? "☀️"
            : "🌙";
    }

    updateIcon();

    /*=========================
        Clique no botão
    =========================*/

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            body.classList.toggle("light-theme");

            const currentTheme = body.classList.contains("light-theme")
                ? "light"
                : "dark";

            localStorage.setItem("theme", currentTheme);

            updateIcon();

        });

    }

});