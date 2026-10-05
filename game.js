let selectedCharacter = null;
let attempts = 0;

const chestItems = [
  "JAS HUJAN",
  "GELAS KACA",
  "SENTER"
];

function showCharacter() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.remove("hidden");
}

function backHome() {
  document.getElementById("character-screen").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}

function selectCharacter(name) {
  selectedCharacter = name;
  document.getElementById("selected").textContent =
    "SELECTED: " + name;
}

function startGame() {
  if (!selectedCharacter) {
    alert("Pilih karakter terlebih dahulu.");
    return;
  }

  document.getElementById("home").classList.add("hidden");
  document.getElementById("character-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  attempts = 0;
  document.getElementById("status").textContent =
    "SEARCH THE CHESTS — 2 ATTEMPTS";
}

function openChest(index) {
  if (attempts >= 2) return;

  attempts++;

  const item = chestItems[index];

  if (item === "SENTER") {
    document.getElementById("status").textContent =
      "✓ SEARCH SUCCESSFUL — FLASHLIGHT FOUND";

    setTimeout(() => {
      alert("ITEM FOUND!\n\nThe next room can now be unlocked.");
    }, 200);

    return;
  }

  const remaining = 2 - attempts;

  if (remaining > 0) {
    document.getElementById("status").textContent =
      "WRONG ITEM — " + remaining + " ATTEMPT LEFT";
  } else {
    document.getElementById("status").textContent =
      "✕ SEARCH FAILED — RESTART REQUIRED";

    setTimeout(() => {
      if (confirm("Search failed. Restart level?")) {
        location.reload();
      }
    }, 300);
  }
}
