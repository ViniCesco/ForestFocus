document.addEventListener("DOMContentLoaded", () => {
  const tiers = document.querySelectorAll(".donation-tier");
  const supportButton = document.getElementById("donationSupportButton");

  let selectedLink = null;

  tiers.forEach((tier) => {
    tier.addEventListener("click", () => {
      tiers.forEach((t) => t.classList.remove("selected"));
      tier.classList.add("selected");

      selectedLink = tier.dataset.link;

      supportButton.disabled = false;
      supportButton.classList.add("active");
    });
  });

  supportButton.addEventListener("click", () => {
    if (!selectedLink || supportButton.disabled) return;

    if (selectedLink.startsWith("COLE_SEU_LINK")) {
      alert("Ainda falta colocar o link de pagamento do Mercado Pago nesse nível de doação (veja o atributo data-link no HTML).");
      return;
    }

    window.open(selectedLink, "_blank");
  });
});