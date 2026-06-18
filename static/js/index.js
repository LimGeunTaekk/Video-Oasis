document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".shortcut-card");
  const modal = document.getElementById("shortcut-modal");

  if (modal && cards.length > 0) {
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalType = document.getElementById("modal-type");
    const modalBenchmark = document.getElementById("modal-benchmark");
    const modalQuestion = document.getElementById("modal-question");
    const modalAnswer = document.getElementById("modal-answer");
    const modalReason = document.getElementById("modal-reason");

    const closeButton = modal.querySelector(".shortcut-modal-close");
    const background = modal.querySelector(".shortcut-modal-background");
    let lastFocusedCard = null;

    function getCardValue(card, key) {
      return card.dataset[key] || "";
    }

    function initializeCardMedia(card) {
      const mediaType = getCardValue(card, "mediaType") || "image";
      const mediaSrc = getCardValue(card, "mediaSrc");
      const wrapper = card.querySelector(".shortcut-card-media-wrapper");
      const image = wrapper ? wrapper.querySelector("img") : null;

      if (!wrapper || !image || !mediaSrc) {
        return;
      }

      if (mediaType !== "video") {
        image.src = mediaSrc;
        image.alt = getCardValue(card, "benchmark")
          || getCardValue(card, "question")
          || "Shortcut case preview";
        return;
      }

      const video = document.createElement("video");
      video.src = mediaSrc;
      video.poster = getCardValue(card, "poster");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-hidden", "true");
      image.replaceWith(video);

      card.addEventListener("mouseenter", function () {
        video.play().catch(function () {});
      });

      card.addEventListener("mouseleave", function () {
        video.pause();
      });

      card.addEventListener("focus", function () {
        video.play().catch(function () {});
      });

      card.addEventListener("blur", function () {
        video.pause();
      });
    }

    function openModal(card) {
      const benchmark = getCardValue(card, "benchmark");
      const question = getCardValue(card, "question");
      const type = getCardValue(card, "type");
      const mediaType = getCardValue(card, "mediaType") || "image";
      const mediaSrc = getCardValue(card, "mediaSrc");

      lastFocusedCard = card;

      if (mediaType === "video") {
        modalImage.hidden = true;
        modalVideo.hidden = false;
        modalVideo.poster = getCardValue(card, "poster");
        modalVideo.src = mediaSrc;
        modalVideo.load();
      } else {
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
        modalVideo.hidden = true;
        modalImage.hidden = false;
        modalImage.src = mediaSrc;
        modalImage.alt = benchmark || question || "Shortcut case preview";
      }

      modalType.textContent = type;
      modalBenchmark.textContent = benchmark;
      modalQuestion.textContent = question;
      modalAnswer.textContent = getCardValue(card, "answer");
      modalReason.textContent = getCardValue(card, "reason");

      modal.classList.add("is-active");
      document.body.style.overflow = "hidden";
      closeButton.focus();
    }

    function closeModal() {
      modalVideo.pause();
      modal.classList.remove("is-active");
      document.body.style.overflow = "";

      if (lastFocusedCard) {
        lastFocusedCard.focus();
      }
    }

    cards.forEach(function (card) {
      initializeCardMedia(card);

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
  }

  const insightsRail = document.querySelector(".insights-rail");
  const previousInsightButton = document.querySelector(".insights-control-prev");
  const nextInsightButton = document.querySelector(".insights-control-next");

  if (insightsRail && previousInsightButton && nextInsightButton) {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    function getInsightScrollAmount() {
      const panel = insightsRail.querySelector(".insight-panel");
      const styles = window.getComputedStyle(insightsRail);
      const gap = parseFloat(styles.columnGap) || 0;

      return panel ? panel.getBoundingClientRect().width + gap : insightsRail.clientWidth;
    }

    function updateInsightControls() {
      const maxScrollLeft = insightsRail.scrollWidth - insightsRail.clientWidth;

      previousInsightButton.disabled = insightsRail.scrollLeft <= 2;
      nextInsightButton.disabled = insightsRail.scrollLeft >= maxScrollLeft - 2;
    }

    previousInsightButton.addEventListener("click", function () {
      insightsRail.scrollBy({
        left: -getInsightScrollAmount(),
        behavior: "smooth"
      });
    });

    nextInsightButton.addEventListener("click", function () {
      insightsRail.scrollBy({
        left: getInsightScrollAmount(),
        behavior: "smooth"
      });
    });

    insightsRail.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") {
        return;
      }

      isDragging = true;
      dragStartX = event.clientX;
      dragStartScrollLeft = insightsRail.scrollLeft;
      insightsRail.classList.add("is-dragging");
      insightsRail.setPointerCapture(event.pointerId);
    });

    insightsRail.addEventListener("pointermove", function (event) {
      if (!isDragging) {
        return;
      }

      insightsRail.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
    });

    function stopInsightDragging(event) {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      insightsRail.classList.remove("is-dragging");

      if (insightsRail.hasPointerCapture(event.pointerId)) {
        insightsRail.releasePointerCapture(event.pointerId);
      }
    }

    insightsRail.addEventListener("pointerup", stopInsightDragging);
    insightsRail.addEventListener("pointercancel", stopInsightDragging);
    insightsRail.addEventListener("scroll", updateInsightControls);
    window.addEventListener("resize", updateInsightControls);
    updateInsightControls();
  }
});
