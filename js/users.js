import {
  ADD_SQUARE_SVG,
  SPINNER_SVG,
  ARROW_RIGHT_SVG,
  ARROW_LEFT_SVG,
} from "../svg/icons.js";

import { fetchUsers, fetchImages } from "./api.js";
import { createSkeletons } from "./ui.js";

const container = document.querySelector(".users-cards");
const searchInput = document.querySelector(".search-input");
const loadMoreBtn = document.querySelector(".btn-load-more");
const paginationContainer = document.querySelector(".pagination");
const separator = document.querySelector(".separator");

const USERS_PER_PAGE = 20;
const INITIAL_FETCH = 60;
const MAX_USERS = 100;

let allUsers = [];
let filteredUsers = [];
let image = null;
let currentPage = 1;
loadMoreBtn.innerHTML = `${ADD_SQUARE_SVG} Load More`;

function scrollToSeparator() {
  separator.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateLoadMoreButton() {
  loadMoreBtn.classList.toggle("hidden", allUsers.length >= MAX_USERS);
}

function renderUsers(users) {
  filteredUsers = users;
  container.classList.add("grid-layout");
  container.innerHTML = "";

  if (users.length === 0) {
    container.classList.remove("grid-layout");
    container.innerHTML = `<p class="message">No results found.</p>`;
    paginationContainer.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const start = (currentPage - 1) * USERS_PER_PAGE;
  const end = start + USERS_PER_PAGE;
  const pageUsers = users.slice(start, end);

  pageUsers.forEach((user) => {
    const card = document.createElement("div");
    card.classList.add("user-card");

    const imageUrlToSplit = image.url;
    const randomize = `seed/${user.id}/`;
    const splitUrl = imageUrlToSplit.split(".photos");
    const imageUrl = `${splitUrl[0]}.photos/${randomize}${splitUrl[1]}`;

    card.addEventListener("click", () => {
      const profileData = {
        ...user,
        profileImage: imageUrl,
      };
      sessionStorage.setItem("selectedProfile", JSON.stringify(profileData));
      location.href = `profile.html?id=${user.id}`;
    });

    card.innerHTML = `
      <img src="${imageUrl}" />
      <h3>${user.firstname} ${user.lastname}</h3>
      <p>${user.email}</p>
      <a href="${user.website}" class="pill" target="_blank">${user.website}</a>
    `;

    container.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = ARROW_LEFT_SVG;
  prevBtn.disabled = currentPage === 1;
  prevBtn.classList.add("btn", "btn-pagination");
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderUsers(filteredUsers);
      scrollToSeparator();
    }
  });
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("btn", "btn-pagination");
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderUsers(filteredUsers);
      scrollToSeparator();
    });

    paginationContainer.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = ARROW_RIGHT_SVG;
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.classList.add("btn", "btn-pagination");
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderUsers(filteredUsers);
      scrollToSeparator();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

async function initUsers() {
  createSkeletons(container, USERS_PER_PAGE);

  try {
    const localUsers = JSON.parse(localStorage.getItem("nexanext_users")) || [];

    const [apiUsers, images] = await Promise.all([
      fetchUsers(INITIAL_FETCH),
      fetchImages(1),
    ]);

    image = images[0];

    allUsers = [...localUsers, ...apiUsers];

    currentPage = 1;
    renderUsers(allUsers);
    updateLoadMoreButton();
  } catch (error) {
    container.classList.remove("grid-layout");
    container.innerHTML = `<p class="message error">Failed to load users.</p>`;
    console.error(error);
  }
}

async function handleLoadMore() {
  if (allUsers.length >= MAX_USERS) return;

  loadMoreBtn.disabled = true;
  loadMoreBtn.innerHTML = `${SPINNER_SVG} Loading...`;

  const amountToFetch =
    allUsers.length + 20 > MAX_USERS ? MAX_USERS - allUsers.length : 20;

  try {
    const newUsers = await fetchUsers(amountToFetch);
    allUsers.push(...newUsers);

    renderUsers(allUsers);
    updateLoadMoreButton();

    if (allUsers.length >= MAX_USERS) {
      loadMoreBtn.removeEventListener("click", handleLoadMore);
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add("hidden");
      return;
    }

    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = `${ADD_SQUARE_SVG} Load More`;
  } catch (error) {
    console.error("Failed to load more users", error);
    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = `${ADD_SQUARE_SVG} Load More`;
  }
}

loadMoreBtn.addEventListener("click", handleLoadMore);

searchInput.addEventListener("input", () => {
  currentPage = 1;
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    renderUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter((user) =>
    `${user.firstname} ${user.lastname} ${user.email} ${user.website}`
      .toLowerCase()
      .includes(query),
  );

  renderUsers(filtered);
});

initUsers();
