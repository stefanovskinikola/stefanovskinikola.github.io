import { fetchImages } from "./api.js";
import { createSkeletons } from "./ui.js";

const galleryGrid = document.querySelector(".grid-layout");
const imageModalOverlay = document.querySelector(".image-modal-overlay");
const modalImageContainer = document.querySelector(".modal-image-container");
const modalImage = document.querySelector(".modal-image");
const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");

let currentGalleryImages = [];
let currentImageIndex = 0;

// SAME LOGIC WILL BE IN PROFILE.JS - CONSIDER CREATING A SHARED MODULE

modalImageContainer.addEventListener("click", (e) => e.stopPropagation());

function updateModalImage() {
  modalImage.src = currentGalleryImages[currentImageIndex];
}

function openModal(index) {
  const allImages = document.querySelectorAll(".gallery-image");
  currentGalleryImages = Array.from(allImages).map((img) => img.src);

  currentImageIndex = index;
  updateModalImage();

  imageModalOverlay.classList.add("show");
}

function closeModal() {
  modalImage.src = "";
  imageModalOverlay.classList.remove("show");
}

function showNext() {
  currentImageIndex++;
  if (currentImageIndex >= currentGalleryImages.length) {
    currentImageIndex = 0;
  }
  updateModalImage();
}

function showPrev() {
  currentImageIndex--;
  if (currentImageIndex < 0) {
    currentImageIndex = currentGalleryImages.length - 1;
  }
  updateModalImage();
}

btnNext.addEventListener("click", (event) => {
  event.stopPropagation();
  showNext();
});

btnPrev.addEventListener("click", (event) => {
  event.stopPropagation();
  showPrev();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  const galleryWrapper = target.closest(".gallery-image-wrapper");

  if (target.classList.contains("profile-image")) {
    modalImage.src = target.src;
    imageModalOverlay.classList.add("show");
    btnPrev.classList.add("hidden");
    btnNext.classList.add("hidden");
  } else if (galleryWrapper) {
    btnPrev.classList.remove("hidden");
    btnNext.classList.remove("hidden");

    const allWrappers = Array.from(
      document.querySelectorAll(".gallery-image-wrapper"),
    );
    const index = allWrappers.indexOf(galleryWrapper);

    openModal(index);
  }
});

document.addEventListener("keydown", (event) => {
  if (!imageModalOverlay.classList.contains("show")) return;

  if (event.key === "Escape") closeModal();

  if (btnNext.classList.contains("hidden")) return;

  if (event.key === "ArrowLeft") showPrev();

  if (event.key === "ArrowRight") showNext();
});

imageModalOverlay.addEventListener("click", closeModal);

document.addEventListener("DOMContentLoaded", () => {
  const storedData = sessionStorage.getItem("selectedProfile");
  const btnProfile = document.querySelector(".btn-profile");

  if (!storedData) {
    location.href = "index.html";
    return;
  }

  const user = JSON.parse(storedData);

  document.title = `${user.firstname} ${user.lastname} Gallery | NexaNext`;

  const profileImage = document.querySelector(".profile-image");
  profileImage.src = user.profileImage;

  const profileName = document.querySelector(".profile-name");
  profileName.textContent = `${user.firstname} ${user.lastname}`;

  const profileWebsite = document.querySelector(".profile-website");
  profileWebsite.textContent = user.website;
  profileWebsite.href = user.website;
  profileWebsite.target = "_blank";

  const btnEmail = document.querySelector(".btn-email");
  btnEmail.href = `mailto:${user.email}`;

  const btnCall = document.querySelector(".btn-call");
  btnCall.href = `tel:${user.phone}`;

  btnProfile.addEventListener("click", () => {
    const userId = user.id;
    location.href = `profile.html?id=${userId}`;
  });
});

export async function renderBio() {
  const bioContainer = document.querySelector(".profile-bio");
  const storedUser = JSON.parse(sessionStorage.getItem("selectedProfile"));

  if (storedUser.bio && storedUser.bio !== "No description provided.") {
    bioContainer.textContent = storedUser.bio;
    return;
  }

  try {
    bioContainer.innerHTML = `<p class="loading-message">${SPINNER_SVG} Loading bio...</p>`;

    const data = await fetchTexts(1, 200);
    const bio = data[0].content;
    bioContainer.textContent = bio;

    storedUser.bio = bio;
    sessionStorage.setItem("selectedProfile", JSON.stringify(storedUser));
  } catch (err) {
    console.error("Bio load failed:", err);
    bioContainer.textContent = "No description provided.";
  }
}

async function renderGallery() {
  const imageCount = Math.floor(Math.random() * 11) + 10;
  createSkeletons(galleryGrid, imageCount);

  try {
    const imageData = await fetchImages(1);

    galleryGrid.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
      const imageUrl = `${imageData[0].url}?random=${i}`;

      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("gallery-image-wrapper");

      imageWrapper.innerHTML = `
        <img class="gallery-image" src="${imageUrl}" />
          <div class="overlay">
            <span>some image description here</span>
        </div>`;

      galleryGrid.appendChild(imageWrapper);
    }
  } catch (error) {
    galleryGrid.classList.remove("grid-layout");
    console.error("Gallery load failed:", error);
    galleryGrid.innerHTML = `<p class="loading-message error">Failed to load images.</p>`;
  }
}

renderGallery();
renderBio();
