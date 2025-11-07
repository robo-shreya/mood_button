// ===== Built-in categories =====
const categories = {
  Calm: [
    "🧊 Calm like ice water.",
    "🪴 Soft plant mode.",
    "🌊 Low tide, steady steps.",
    "🛁 Bath-bomb brain, fizzing gently.",
    "🌙 Quiet moon, no rush."
  ],
  Hype: [
    "🔥 Main character energy.",
    "⚡ Gremlin focus activated.",
    "🚀 Speedrun life today.",
    "🦁 Loud, golden, unstoppable.",
    "🥇 I am the feature, not a bug."
  ],
  Focus: [
    "🧠 Nerd mode: compiling feelings...",
    "🎯 Laser pointer brain.",
    "📚 Monk at the library arc.",
    "🧩 One line at a time.",
    "🔬 Microscope mindset."
  ]
};
const CATEGORY_ORDER = ["All", "Calm", "Hype", "Focus"];

// ===== Elements =====
const elDisplay = document.getElementById("moodDisplay");
const elBtn = document.getElementById("moodBtn");
const tabEls = Array.from(document.querySelectorAll(".tab"));
const elNewMood = document.getElementById("newMood");
const elAddBtn = document.getElementById("addBtn");
const elCatName = document.getElementById("catName");
const elCustomList = document.getElementById("customList");

// ===== Persistence: custom moods per category =====
const CUSTOM_KEY = "customMoods";
let customMoods = loadCustomMoods(); // { Calm: [...], Hype: [...], Focus: [...] }

function loadCustomMoods() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Ensure arrays exist
    for (const k of ["Calm", "Hype", "Focus"]) {
      if (!Array.isArray(parsed[k])) parsed[k] = [];
    }
    return parsed;
  } catch {
    return { Calm: [], Hype: [], Focus: [] };
  }
}
function saveCustomMoods() {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customMoods));
}

// ===== Helpers =====
function getAllBuiltIn() {
  return Object.values(categories).flat();
}
function getAllCustom() {
  return Object.values(customMoods).flat();
}
function getMoodsFor(cat) {
  if (cat === "All") return [...getAllBuiltIn(), ...getAllCustom()];
  return [...(categories[cat] || []), ...(customMoods[cat] || [])];
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== State =====
let currentCategory = localStorage.getItem("moodCategory") || "All";

// ===== UI updates =====
function updateTabsUI() {
  tabEls.forEach((btn) => {
    const isActive = btn.dataset.cat === currentCategory;
    btn.setAttribute("aria-selected", String(isActive));
  });
}
function updateAddUI() {
  elCatName.textContent = currentCategory;
  const disabled = currentCategory === "All";
  elNewMood.disabled = disabled;
  elAddBtn.disabled = disabled;
  elNewMood.placeholder = disabled
    ? "Pick Calm/Hype/Focus to add"
    : "e.g., 🦋 hopeful gremlin";
}
function renderCustomList() {
  const list = currentCategory === "All" ? [] : (customMoods[currentCategory] || []);
  elCustomList.innerHTML = "";
  if (currentCategory === "All") {
    const li = document.createElement("li");
    li.className = "custom-item";
    li.textContent = "“All” is view-only. Switch to Calm/Hype/Focus to manage customs.";
    elCustomList.appendChild(li);
    return;
  }
  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "custom-item";
    li.textContent = "No custom moods yet. Add your first one!";
    elCustomList.appendChild(li);
    return;
  }
  list.forEach((text, idx) => {
    const li = document.createElement("li");
    li.className = "custom-item";
    const span = document.createElement("span");
    span.textContent = text;
    const del = document.createElement("button");
    del.setAttribute("aria-label", `Delete mood ${text}`);
    del.textContent = "×";
    del.addEventListener("click", () => {
      customMoods[currentCategory].splice(idx, 1);
      saveCustomMoods();
      renderCustomList();
    });
    li.appendChild(span);
    li.appendChild(del);
    elCustomList.appendChild(li);
  });
}

function setCategory(cat, { save = true } = {}) {
  if (!CATEGORY_ORDER.includes(cat)) cat = "All";
  currentCategory = cat;
  if (save) localStorage.setItem("moodCategory", currentCategory);
  updateTabsUI();
  updateAddUI();
  renderCustomList();
  setRandomMood();
}

function setRandomMood() {
  const mood = pickRandom(getMoodsFor(currentCategory));
  elDisplay.textContent = mood || "😶 (no moods in this category yet)";
  localStorage.setItem("lastMood", elDisplay.textContent);

  elDisplay.animate(
    [{ transform: "scale(0.98)" }, { transform: "scale(1)" }],
    { duration: 120, easing: "ease-out" }
  );
}

// ===== Add mood handlers =====
function sanitizeMoodInput(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  // Collapse whitespace
  return s.replace(/\s+/g, " ").slice(0, 120);
}
function addMoodToCurrent() {
  if (currentCategory === "All") return; // guard
  const text = sanitizeMoodInput(elNewMood.value);
  if (!text) return;

  const list = customMoods[currentCategory];
  // Avoid dupes (case-insensitive)
  const exists = list.some((t) => t.toLowerCase() === text.toLowerCase());
  if (exists) {
    // brief visual feedback
    elNewMood.animate([{ transform: "translateX(0)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }], { duration: 180 });
    return;
  }
  list.push(text);
  saveCustomMoods();
  elNewMood.value = "";
  renderCustomList();
}

elAddBtn.addEventListener("click", addMoodToCurrent);
elNewMood.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addMoodToCurrent();
  if (e.key === "Escape") elNewMood.value = "";
});

// ===== Events =====
// Tabs click
tabEls.forEach((btn) => {
  btn.addEventListener("click", () => setCategory(btn.dataset.cat));
});

// Button click
elBtn.addEventListener("click", setRandomMood);

// Keyboard: Space randomizes; ArrowLeft/Right cycles tabs; 1–4 jump to tab
document.addEventListener("keydown", (e) => {
  const code = e.code || e.key;

  // Space => randomize
  if (code === "Space" || e.key === " ") {
    e.preventDefault();
    setRandomMood();
    return;
  }

  // Number keys 1–4 => pick tab
  if (/^Digit[1-4]$/.test(code)) {
    const idx = parseInt(code.slice(-1), 10) - 1;
    const cat = CATEGORY_ORDER[idx];
    setCategory(cat);
    return;
  }

  // Arrows => cycle tabs
  if (code === "ArrowRight" || code === "ArrowLeft") {
    e.preventDefault();
    const idx = CATEGORY_ORDER.indexOf(currentCategory);
    const delta = code === "ArrowRight" ? 1 : -1;
    const next = (idx + delta + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
    setCategory(CATEGORY_ORDER[next]);
  }
});

// Click mood to copy to clipboard
elDisplay.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(elDisplay.textContent);
    const original = elDisplay.textContent;
    elDisplay.textContent = original + "  (copied)";
    setTimeout(() => { elDisplay.textContent = original; }, 600);
  } catch (err) {
    console.warn("Clipboard blocked:", err);
  }
});

// ===== First run =====
const saved = localStorage.getItem("lastMood");
if (saved) elDisplay.textContent = saved;
setCategory(currentCategory, { save: false });
if (!saved) setRandomMood();
