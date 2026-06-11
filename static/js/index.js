window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})
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
