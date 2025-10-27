const moods = [
  "😎 Unbothered, moisturized, happy, in my lane.",
  "🔥 Main character energy.",
  "🦦 Cozy otter with productivity potential.",
  "🌪️ Brain tornado, still vibing.",
  "🌈 Existential but cute.",
  "🧠 Nerd mode: compiling feelings...",
  "🧊 Calm like ice water.",
  "⚡ Gremlin focus activated.",
  "🌻 Soft sunshine + subtle menace.",
  "🐍 Sly but productive snake."
];

const elDisplay = document.getElementById("moodDisplay");
const elBtn = document.getElementById("moodBtn");

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setRandomMood() {
  const mood = pickRandom(moods);

  elDisplay.textContent = mood;
  // Tiny animation feedback
  elDisplay.animate(
    [{ transform: "scale(0.98)" }, { transform: "scale(1)" }],
    { duration: 120, easing: "ease-out" }
  );

  localStorage.setItem("lastMood", mood);
}

elBtn.addEventListener("click", setRandomMood);

  
elDisplay.addEventListener("click", async () => {
  await navigator.clipboard.writeText(elDisplay.textContent);
  elDisplay.textContent += "  (copied)";
  setTimeout(displayMood, 600);
});

// Keyboard access: Space triggers randomize
document.addEventListener("keydown", (e) => {
  const isSpace = e.code === "Space" || e.key === " ";
  if (isSpace) {
    e.preventDefault();
    setRandomMood();
  }
});

function displayMood(){
  const saved = localStorage.getItem("lastMood");
  if (saved) elDisplay.textContent = saved
}

// First run: load mood from local storage
displayMood();
