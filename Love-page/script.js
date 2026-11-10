// Change this to the recipient's name
const recipientName = "Someone Special";

// Find the HTML elements we need
const giftButton = document.getElementById("giftButton");
const giftScreen = document.getElementById("giftScreen");
const loveScreen = document.getElementById("loveScreen");
const countdown = document.getElementById("countdown");
const galleryTitle = document.getElementById("galleryTitle");

const cards = document.querySelectorAll(".photo-card");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const photoCounter = document.getElementById("photoCounter");

const loveButton = document.getElementById("loveButton");
const loveMessages = document.getElementById("loveMessages");
const loveStatus = document.getElementById("loveStatus");
const finalMessage = document.getElementById("finalMessage");

const heartsContainer = document.getElementById("hearts");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

// Personalise the heading safely
document.querySelector("h1").textContent =
  `Hey, ${recipientName} ❤️`;

// Remember which picture is in the centre
let currentPhoto = 0;


// OPEN THE GIFT

giftButton.addEventListener("click", function () {
  // Prevent repeated clicks while counting down
  giftButton.disabled = true;

  let seconds = 3;
  countdown.textContent = seconds;

  const countdownTimer = setInterval(function () {
    seconds--;

    if (seconds > 0) {
      countdown.textContent = seconds;
    } else {
      clearInterval(countdownTimer);

      giftScreen.hidden = true;
      loveScreen.hidden = false;

      updateCarousel();
      galleryTitle.focus();
      releaseHearts(30);
    }
  }, 1000);
});


// ARRANGE THE PHOTO CARDS

function updateCarousel() {
  const totalPhotos = cards.length;

  cards.forEach(function (card, index) {
    // Work out how far this card is from the centre card
    let distance = index - currentPhoto;

    // Wrap cards around either end of the gallery
    if (distance > totalPhotos / 2) {
      distance -= totalPhotos;
    }

    if (distance < -totalPhotos / 2) {
      distance += totalPhotos;
    }

    const isCentre = distance === 0;
    const isVisible = Math.abs(distance) <= 2;

    // Give CSS the values needed to position this card
    card.style.setProperty("--offset", `${distance * 145}px`);
    card.style.setProperty("--scale", isCentre ? "1" : "0.8");

    card.style.setProperty(
      "--rotation",
      `${distance * -12}deg`
    );

    card.style.setProperty(
      "--opacity",
      isVisible ? (isCentre ? "1" : "0.55") : "0"
    );

    card.style.setProperty(
      "--layer",
      `${10 - Math.abs(distance)}`
    );

    // Screen readers read the currently selected photo
    card.setAttribute("aria-hidden", String(!isCentre));
  });

  photoCounter.textContent =
    `${currentPhoto + 1} / ${totalPhotos}`;
}


// CHANGE THE SELECTED PHOTO

nextButton.addEventListener("click", function () {
  currentPhoto = (currentPhoto + 1) % cards.length;
  updateCarousel();
});

previousButton.addEventListener("click", function () {
  currentPhoto =
    (currentPhoto - 1 + cards.length) % cards.length;

  updateCarousel();
});


// DISPLAY 1,000 LOVE MESSAGES

loveButton.addEventListener("click", function () {
  // Clear any previous messages before creating them again
  loveMessages.replaceChildren();

  // Prepare the messages together before adding them to the page
  const messages = document.createDocumentFragment();

  for (let i = 1; i <= 1000; i++) {
    const line = document.createElement("p");

    line.className = "love-line";
    line.textContent = `${i}. I love you, ${recipientName} ❤️`;

    messages.appendChild(line);
  }

  loveMessages.appendChild(messages);
  loveMessages.hidden = false;
  loveMessages.scrollTop = 0;

  loveStatus.textContent = "1,000 messages, just for you ❤️";
  finalMessage.hidden = false;
  loveButton.textContent = "Show them again ❤️";

  releaseHearts(40);
});


// CREATE ONE FALLING HEART

function createHeart() {
  if (reducedMotion.matches) {
    return;
  }

  const heart = document.createElement("span");

  heart.className = "falling-heart";
  heart.textContent = "♥";

  // Choose a random horizontal position
  heart.style.left = `${Math.random() * 100}%`;

  // Choose a random size between 12 and 32 pixels
  heart.style.setProperty(
    "--size",
    `${12 + Math.random() * 20}px`
  );

  // Choose a random falling time between 4 and 7 seconds
  heart.style.setProperty(
    "--duration",
    `${4 + Math.random() * 3}s`
  );

  heartsContainer.appendChild(heart);

  // Remove the heart after its animation finishes
  heart.addEventListener("animationend", function () {
    heart.remove();
  });
}


// RELEASE SEVERAL HEARTS

function releaseHearts(amount) {
  for (let i = 0; i < amount; i++) {
    setTimeout(createHeart, i * 60);
  }
}


// Keep a gentle stream of hearts falling
setInterval(function () {
  if (!document.hidden) {
    createHeart();
  }
}, 500);