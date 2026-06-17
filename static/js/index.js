document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".shortcut-card");
  const modal = document.getElementById("shortcut-modal");

  if (!modal || cards.length === 0) {
    return;
  }

  const modalImage = document.getElementById("modal-image");
  const modalType = document.getElementById("modal-type");
  const modalBenchmark = document.getElementById("modal-benchmark");
  const modalQuestion = document.getElementById("modal-question");
  const modalAnswer = document.getElementById("modal-answer");
  const modalReason = document.getElementById("modal-reason");
  const modalEvidence = document.getElementById("modal-evidence");

  const closeButton = modal.querySelector(".shortcut-modal-close");
  const background = modal.querySelector(".shortcut-modal-background");
  let lastFocusedCard = null;

  function getCardValue(card, key) {
    return card.dataset[key] || "";
  }

  function openModal(card) {
    const benchmark = getCardValue(card, "benchmark");
    const question = getCardValue(card, "question");
    const type = getCardValue(card, "type");

    lastFocusedCard = card;

    modalImage.src = getCardValue(card, "image");
    modalImage.alt = benchmark || question || "Shortcut diagnostic evidence";
    modalType.textContent = type;
    modalBenchmark.textContent = benchmark;
    modalQuestion.textContent = question;
    modalAnswer.textContent = getCardValue(card, "answer");
    modalReason.textContent = getCardValue(card, "reason");
    modalEvidence.textContent = getCardValue(card, "evidence");

    modal.classList.add("is-active");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove("is-active");
    document.body.style.overflow = "";

    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      openModal(card);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  closeButton.addEventListener("click", closeModal);
  background.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-active")) {
      closeModal();
    }
  });
});
