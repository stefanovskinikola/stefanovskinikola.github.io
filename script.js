const orderType = document.getElementById("order-type");
const dateInput = document.getElementById("delivery-date");
const timeInput = document.getElementById("delivery-time");
const noteEl = document.getElementById("delivery-note");

// ==================================================
// Dynamic Required Fields Based on Order Type
// ==================================================
const deliveryFields = [
  {
    input: document.getElementById("address"),
    marker: document.querySelector('label[for="address"] .required'),
  },
  {
    input: document.getElementById("apartment"),
    marker: document.querySelector('label[for="apartment"] .required'),
  },
  {
    input: document.getElementById("delivery-date"),
    marker: document.querySelector('label[for="delivery-date"] .required'),
  },
  {
    input: document.getElementById("delivery-time"),
    marker: document.querySelector('label[for="delivery-time"] .required'),
  },
];

function updateRequiredFields() {
  const ifDelivery = orderType.value === "delivery";

  deliveryFields.forEach(({ input, marker }) => {
    input.required = ifDelivery;
    marker.textContent = ifDelivery ? "*" : "";
  });
}

// Listen for dropdown change
orderType.addEventListener("change", updateRequiredFields);
updateRequiredFields();

// ==================================================
// Add or remove the "empty" class based on whether the input has a value
// ==================================================
function updateEmptyClass(input) {
  if (input.value === "") {
    input.classList.add("empty"); // Add class if no value
  } else {
    input.classList.remove("empty"); // Remove class when user selects a value
  }
}

// Run once on page load to set initial state
updateEmptyClass(dateInput);
updateEmptyClass(timeInput);

// Listen for any changes in the inputs
["input", "change"].forEach((eventName) => {
  dateInput.addEventListener(eventName, () => updateEmptyClass(dateInput));
  timeInput.addEventListener(eventName, () => updateEmptyClass(timeInput));
});

// ==================================================
// Date and Time Restrictions
// ==================================================
// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get time + 30 minutes in HH:MM
function getTimePlus30() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now.toTimeString().slice(0, 5);
}

// Update the displayed message
function updateEarliestMessage() {
  const earliest = getTimePlus30();
  noteEl.textContent = `Earliest possible delivery: ${earliest} today.`;
}

// Update restrictions on both date and time
function updateRestrictions() {
  const today = getTodayDate();
  const earliest = getTimePlus30();

  if (dateInput.value === today) {
    timeInput.min = earliest;
  } else {
    timeInput.min = "";
  }
}

// Set min date
dateInput.min = getTodayDate();

// When the date changes
dateInput.addEventListener("change", updateRestrictions);

// Initial run
updateEarliestMessage();
updateRestrictions();

// Auto-update every minute
setInterval(() => {
  updateEarliestMessage();
  updateRestrictions();
}, 60 * 1000);
