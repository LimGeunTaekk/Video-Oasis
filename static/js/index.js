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

  function openModal(card) {
    modalImage.src = card.dataset.image;
    modalType.textContent = card.dataset.type;
    modalBenchmark.textContent = card.dataset.benchmark;
    modalQuestion.textContent = card.dataset.question;
    modalAnswer.textContent = card.dataset.answer;
    modalReason.textContent = card.dataset.reason;
    modalEvidence.textContent = card.dataset.evidence;

    modal.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      openModal(card);
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
