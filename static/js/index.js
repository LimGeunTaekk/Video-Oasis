document.addEventListener("DOMContentLoaded", function () {
  // Shared flag so dragging the rail does not trigger a card click → modal.
  let shortcutRailDragged = false;

  // ----- Shortcut detail modal (video on the left, Q/A on the right) -----
  const modal = document.getElementById("shortcut-modal");
  const cards = document.querySelectorAll(".shortcut-overview-card");

  if (modal && cards.length > 0) {
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalType = document.getElementById("modal-type");
    const modalBenchmark = document.getElementById("modal-benchmark");
    const modalQuestion = document.getElementById("modal-question");
    const modalOptions = document.getElementById("modal-options");
    const modalAnswer = document.getElementById("modal-answer");
    const modalReason = document.getElementById("modal-reason");

    const modalLayout = modal.querySelector(".shortcut-modal-layout");
    const modalMediaWrapper = modal.querySelector(".shortcut-modal-media-wrapper");
    const closeButton = modal.querySelector(".shortcut-modal-close");
    const background = modal.querySelector(".shortcut-modal-background");
    let lastFocusedCard = null;

    function getCardValue(card, key) {
      return card.dataset[key] || "";
    }

    function renderOptions(rawOptions, correctLabel) {
      modalOptions.innerHTML = "";

      const options = rawOptions
        .split("||")
        .map(function (option) {
          return option.trim();
        })
        .filter(Boolean);

      if (options.length === 0) {
        modalOptions.hidden = true;
        return;
      }

      const normalizedCorrect = (correctLabel || "").trim().toUpperCase();

      options.forEach(function (option) {
        const item = document.createElement("div");
        item.className = "shortcut-modal-option";

        const match = option.match(/^([A-Z])[.)]\s*(.*)$/);
        const label = match ? match[1].toUpperCase() : "";
        const text = match ? match[2] : option;

        if (label && label === normalizedCorrect) {
          item.classList.add("is-correct");
        }

        if (label) {
          const tag = document.createElement("b");
          tag.textContent = label;
          item.appendChild(tag);
        }

        const span = document.createElement("span");
        span.textContent = text;
        item.appendChild(span);

        modalOptions.appendChild(item);
      });

      modalOptions.hidden = false;
    }

    function openModal(card) {
      const type = getCardValue(card, "type");
      const question = getCardValue(card, "question");
      const mediaType = getCardValue(card, "mediaType") || "none";
      const mediaSrc = getCardValue(card, "mediaSrc");
      const hasVideo = mediaType === "video" && mediaSrc;

      lastFocusedCard = card;

      if (modalImage) {
        modalImage.hidden = true;
      }

      if (hasVideo) {
        modalVideo.hidden = false;
        modalVideo.src = mediaSrc;
        modalVideo.load();
        modalVideo.play().catch(function () {});
        if (modalMediaWrapper) {
          modalMediaWrapper.hidden = false;
        }
        if (modalLayout) {
          modalLayout.classList.remove("is-no-video");
        }
      } else {
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
        modalVideo.hidden = true;
        if (modalMediaWrapper) {
          modalMediaWrapper.hidden = true;
        }
        if (modalLayout) {
          modalLayout.classList.add("is-no-video");
        }
      }

      modalType.textContent = type;
      modalBenchmark.textContent = getCardValue(card, "benchmark");
      modalQuestion.textContent = question;
      renderOptions(getCardValue(card, "options"), getCardValue(card, "correct"));
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

    function buildCardSummary(card) {
      if (card.querySelector(".shortcut-overview-card-body")) {
        return;
      }

      const body = document.createElement("div");
      body.className = "shortcut-overview-card-body";
      body.innerHTML =
        '<div class="shortcut-overview-card-top">' +
        '<span class="shortcut-overview-card-type"></span>' +
        '<span class="shortcut-overview-card-bench"></span>' +
        "</div>" +
        '<p class="shortcut-overview-card-q"></p>' +
        '<div class="shortcut-overview-card-answer"><span>Answer</span><strong></strong></div>';

      body.querySelector(".shortcut-overview-card-type").textContent = getCardValue(card, "type");
      body.querySelector(".shortcut-overview-card-bench").textContent = getCardValue(card, "benchmark");
      body.querySelector(".shortcut-overview-card-q").textContent = getCardValue(card, "question");
      body.querySelector(".shortcut-overview-card-answer strong").textContent = getCardValue(card, "answer");

      card.insertBefore(body, card.firstChild);
    }

    cards.forEach(function (card) {
      buildCardSummary(card);

      card.addEventListener("click", function () {
        if (shortcutRailDragged) {
          return;
        }
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

  // ----- Horizontal shortcut rail (page-turn navigation) -----
  const shortcutRail = document.querySelector(".shortcut-overview-rail");
  const previousShortcutButton = document.querySelector(".shortcut-overview-prev");
  const nextShortcutButton = document.querySelector(".shortcut-overview-next");

  if (shortcutRail && previousShortcutButton && nextShortcutButton) {
    const shortcutCards = Array.from(shortcutRail.querySelectorAll(".shortcut-overview-card"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isDraggingShortcut = false;
    let shortcutPointerDown = false;
    let shortcutPointerId = null;
    let shortcutDragStartX = 0;
    let shortcutDragStartScrollLeft = 0;
    let shortcutTurnTimer = null;
    let shortcutWheelLocked = false;

    function getShortcutScrollAmount() {
      const card = shortcutCards[0];
      const styles = window.getComputedStyle(shortcutRail);
      const gap = parseFloat(styles.columnGap) || 0;

      return card ? card.getBoundingClientRect().width + gap : shortcutRail.clientWidth;
    }

    function getCurrentShortcutIndex() {
      const amount = getShortcutScrollAmount();

      return amount ? Math.round(shortcutRail.scrollLeft / amount) : 0;
    }

    function updateShortcutPages() {
      const railRect = shortcutRail.getBoundingClientRect();
      const scrollAmount = getShortcutScrollAmount();

      shortcutCards.forEach(function (card) {
        if (reduceMotion.matches) {
          card.style.removeProperty("--page-angle");
          card.style.removeProperty("--page-origin");
          card.style.removeProperty("--page-shadow-left");
          card.style.removeProperty("--page-shadow-right");
          return;
        }

        const cardRect = card.getBoundingClientRect();
        const distance = Math.max(-1, Math.min(1, (cardRect.left - railRect.left) / scrollAmount));
        const angle = distance * -5;
        const shadowStrength = Math.abs(distance) * 0.12;

        card.style.setProperty("--page-angle", angle.toFixed(2) + "deg");
        card.style.setProperty("--page-origin", distance < 0 ? "right center" : "left center");
        card.style.setProperty("--page-shadow-left", distance > 0 ? shadowStrength.toFixed(3) : "0");
        card.style.setProperty("--page-shadow-right", distance < 0 ? shadowStrength.toFixed(3) : "0");
      });

      const maxScrollLeft = shortcutRail.scrollWidth - shortcutRail.clientWidth;
      previousShortcutButton.disabled = shortcutRail.scrollLeft <= 2;
      nextShortcutButton.disabled = shortcutRail.scrollLeft >= maxScrollLeft - 2;
    }

    function turnShortcutPage(direction) {
      const currentIndex = Math.max(0, Math.min(shortcutCards.length - 1, getCurrentShortcutIndex()));
      const currentCard = shortcutCards[currentIndex];

      window.clearTimeout(shortcutTurnTimer);
      currentCard.classList.add("is-page-turning");

      shortcutRail.scrollBy({
        left: direction * getShortcutScrollAmount(),
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });

      shortcutTurnTimer = window.setTimeout(function () {
        currentCard.classList.remove("is-page-turning");
      }, 480);
    }

    previousShortcutButton.addEventListener("click", function () {
      turnShortcutPage(-1);
    });

    nextShortcutButton.addEventListener("click", function () {
      turnShortcutPage(1);
    });

    shortcutRail.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        turnShortcutPage(event.key === "ArrowLeft" ? -1 : 1);
      }
    });

    shortcutRail.addEventListener("wheel", function (event) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

      if (Math.abs(delta) < 8) {
        return;
      }

      event.preventDefault();

      if (shortcutWheelLocked) {
        return;
      }

      shortcutWheelLocked = true;
      turnShortcutPage(delta > 0 ? 1 : -1);

      window.setTimeout(function () {
        shortcutWheelLocked = false;
      }, 520);
    }, { passive: false });

    shortcutRail.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") {
        return;
      }

      // Don't capture the pointer yet — capturing here would steal the click
      // from the cards and stop the detail popup from opening. We only start a
      // real drag (and capture) once the pointer actually moves far enough.
      shortcutPointerDown = true;
      isDraggingShortcut = false;
      shortcutRailDragged = false;
      shortcutPointerId = event.pointerId;
      shortcutDragStartX = event.clientX;
      shortcutDragStartScrollLeft = shortcutRail.scrollLeft;
    });

    shortcutRail.addEventListener("pointermove", function (event) {
      if (!shortcutPointerDown) {
        return;
      }

      const movement = event.clientX - shortcutDragStartX;

      if (!isDraggingShortcut && Math.abs(movement) > 6) {
        isDraggingShortcut = true;
        shortcutRailDragged = true;
        shortcutRail.classList.add("is-dragging");
        try {
          shortcutRail.setPointerCapture(shortcutPointerId);
        } catch (error) {
          /* capture may fail if the pointer is already gone */
        }
      }

      if (isDraggingShortcut) {
        shortcutRail.scrollLeft = shortcutDragStartScrollLeft - movement;
      }
    });

    function stopShortcutDragging(event) {
      if (!shortcutPointerDown) {
        return;
      }

      shortcutPointerDown = false;

      if (isDraggingShortcut) {
        isDraggingShortcut = false;
        shortcutRail.classList.remove("is-dragging");

        if (shortcutRail.hasPointerCapture(event.pointerId)) {
          shortcutRail.releasePointerCapture(event.pointerId);
        }

        const targetIndex = Math.max(0, Math.min(shortcutCards.length - 1, getCurrentShortcutIndex()));
        shortcutRail.scrollTo({
          left: targetIndex * getShortcutScrollAmount(),
          behavior: reduceMotion.matches ? "auto" : "smooth"
        });
      }

      // Let the click that immediately follows a real drag be swallowed, then reset.
      window.setTimeout(function () {
        shortcutRailDragged = false;
      }, 0);
    }

    shortcutRail.addEventListener("pointerup", stopShortcutDragging);
    shortcutRail.addEventListener("pointercancel", stopShortcutDragging);
    shortcutRail.addEventListener("scroll", updateShortcutPages);
    window.addEventListener("resize", updateShortcutPages);
    updateShortcutPages();
  }

  // ----- Algorithmic insights rail -----
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
