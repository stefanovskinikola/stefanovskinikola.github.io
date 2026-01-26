import { fetchTexts, fetchUsers, fetchImages } from "./api.js";

import {
  GLOBE_SVG,
  EMAIL_SVG,
  PHONE_SVG,
  LOCATION_SVG,
  BIRTHDAY_SVG,
  GENDER_SVG,
  SPINNER_SVG,
  HEART_SVG,
  COMMENT_SVG,
  SHARE_SVG,
} from "../svg/icons.js";

const imageModalOverlay = document.querySelector(".image-modal-overlay");
const modalImageContainer = document.querySelector(".modal-image-container");
const modalImage = document.querySelector(".modal-image");
const postsSection = document.querySelector(".posts-section");
const friendsContainer = document.querySelector(".friends-cards");

modalImageContainer.addEventListener("click", (e) => e.stopPropagation());

function openModal(imageSrc) {
  modalImage.src = imageSrc;
  imageModalOverlay.classList.add("show");
}

function closeModal() {
  modalImage.src = "";
  imageModalOverlay.classList.remove("show");
}

document.addEventListener("click", (event) => {
  const target = event.target;

  if (
    target.classList.contains("profile-image") ||
    target.closest(".post-image")
  )
    openModal(target.src);
});

imageModalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  const storedData = sessionStorage.getItem("selectedProfile");
  const btnGallery = document.querySelector(".btn-gallery");

  if (!storedData) {
    location.href = "index.html";
    return;
  }

  const user = JSON.parse(storedData);

  document.title = `${user.firstname} ${user.lastname} Profile | NexaNext`;

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

  const profileDetails = document.querySelector(".about-details");
  profileDetails.innerHTML = `
    <li>${GLOBE_SVG}${user.website || "Unknown"}</li>
    <li>${EMAIL_SVG}${user.email || "Unknown"}</li>
    <li>${PHONE_SVG}${user.phone || "Unknown"}</li>
    <li>
      ${LOCATION_SVG}
      ${user.address?.city || user.city || "Unknown"}, 
      ${user.address?.country || user.country || "Unknown"}
    </li>
    <li>${BIRTHDAY_SVG}${user.birthday || "Unknown"}</li>
    <li>${GENDER_SVG}${user.gender || "Unknown"}</li>
  `;

  btnGallery.addEventListener("click", () => {
    const userId = user.id;
    location.href = `gallery.html?id=${userId}`;
  });
});

// SAME LOGIC WILL BE IN GALLERY.JS - CONSIDER CREATING A SHARED MODULE

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

export async function renderFriends() {
  friendsContainer.innerHTML = `<p class="loading-message">${SPINNER_SVG} Loading friends...</p>`;

  try {
    const FRIENDS_COUNT = Math.floor(Math.random() * (8 - 4 + 1)) + 4;

    const [usersData, imagesData] = await Promise.all([
      fetchUsers(FRIENDS_COUNT),
      fetchImages(FRIENDS_COUNT),
    ]);

    friendsContainer.innerHTML = "";

    usersData.forEach((friend, index) => {
      const friendImage = `${imagesData[index].url}?random=${index}`;
      const friendCard = document.createElement("div");
      friendCard.classList.add("friend-card");

      friendCard.innerHTML = `
        <div class="friend-img">
          <img src="${friendImage}" />
        </div>
        <div class="friend-details">
          <h3>${friend.firstname} ${friend.lastname}</h3>
          <p>${friend.website}</p>
        </div>`;

      friendCard.addEventListener("click", () => {
        const friendProfileData = {
          ...friend,
          profileImage: friendImage,
        };

        sessionStorage.setItem(
          "selectedProfile",
          JSON.stringify(friendProfileData),
        );
        location.reload();
      });

      friendsContainer.appendChild(friendCard);
    });
  } catch (error) {
    console.error("Error loading friends:", error);
    friendsContainer.innerHTML = `<p class="loading-message error">Failed to load friends.</p>`;
  }
}

async function renderPosts() {
  postsSection.innerHTML = `<p class="loading-message">${SPINNER_SVG} Loading posts...</p>`;

  try {
    const POSTS_COUNT = 5;

    const [textsData, imagesData] = await Promise.all([
      fetchTexts(POSTS_COUNT),
      fetchImages(POSTS_COUNT),
    ]);

    postsSection.innerHTML = "";

    textsData.forEach((textItem, index) => {
      const showImage = Math.random() > 0.5;
      const imageUrl = `${imagesData[index].url}?random=${index}`;
      const postContent = textItem.content;

      const user = JSON.parse(sessionStorage.getItem("selectedProfile"));

      const timeAgo = ["2 hours", "4 hours", "10 hours", "1 day", "2 days"][
        index
      ];

      const post = `
            <div class="post">
              <div class="post-user">
                <img src="${user.profileImage}" />
                <div class="post-user-details">
                  <h3>${user.firstname} ${user.lastname}</h3>
                  <p>${timeAgo} ago</p>
                </div>
              </div>
              <div class="post-content">${postContent}</div>
              ${
                showImage
                  ? `<div class="post-image">
                <img src="${imageUrl}" />
              </div>`
                  : ""
              }
              <div class="separator"></div>
              <div class="post-actions">
                <button class="like">${HEART_SVG} Like</button>
                <button class="comment">${COMMENT_SVG} Comment</button>
                <button class="share">${SHARE_SVG} Share</button>
              </div>
            </div>`;

      postsSection.innerHTML += post;
    });
  } catch (error) {
    postsSection.innerHTML = `<p class="loading-message error">Failed to load posts.</p>`;
    console.error("Error loading posts:", error);
  }
}

renderBio();
renderFriends();
renderPosts();
