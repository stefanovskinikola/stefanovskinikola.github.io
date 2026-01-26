import { SUN_SVG, MOON_SVG } from "../svg/icons.js";

const themeToggleBtn = document.querySelector(".theme-toggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggleBtn) themeToggleBtn.innerHTML = SUN_SVG;
  } else {
    document.body.classList.remove("dark-mode");
    if (themeToggleBtn) themeToggleBtn.innerHTML = MOON_SVG;
  }
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme;

  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  const newTheme = isDark ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});

export function updateAuthUI() {
  const currentUser =
    sessionStorage.getItem("currentUser") ||
    localStorage.getItem("currentUser");
  const btnLogin = document.querySelector(".btn-login");
  const btnSignup = document.querySelector(".btn-signup");
  const btnLogout = document.querySelector(".btn-logout");

  if (currentUser) {
    btnLogin.classList.add("hidden");
    btnSignup.classList.add("hidden");
    btnLogout.classList.remove("hidden");
  } else {
    btnLogin.classList.remove("hidden");
    btnSignup.classList.remove("hidden");
    btnLogout.classList.add("hidden");
  }
}

export function createSkeletons(container, amount) {
  container.innerHTML = "";
  for (let i = 0; i < amount; i++) {
    const card = document.createElement("div");
    card.classList.add("user-card", "skeleton");
    container.appendChild(card);
  }
}

applyTheme(getInitialTheme());
updateAuthUI();
