// ===== MODAL RULES =====
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("rules-modal");
  const openBtn = document.getElementById("btn-rules");
  const closeBtn = modal.querySelector(".modal-close");
  const overlay = modal.querySelector(".modal-overlay");

  const openModal = () => modal.classList.remove("hidden");
  const closeModal = () => modal.classList.add("hidden");

  openBtn.addEventListener("click", () => {
  openModal(); 
  try {
    if (typeof renderRulesTable === "function") {
      renderRulesTable();
    }
    if (typeof renderFeaturesTable === "function") {
      renderFeaturesTable();
    }
  } catch (err) {
    console.error("Ошибка при рендере правил:", err);
  }
});


  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});


function renderFeaturesTable() {
  const tbody = document.getElementById("rules-features-table");
  if (!tbody) return;

  tbody.innerHTML = "";

  const rows = [
    {
      icon: "🪙",
      name: "Золотой элемент",
      desc: "Бонусный правильный элемент",
      effect: `+${getGoldBonus()} очков`,
      note: "Не обязателен для прохождения",
    },
    {
      icon: "💣",
      name: "Ловушка",
      desc: "Скрытый опасный элемент",
      effect: `−${getTrapPenalty()} очков`,
      note: "Проявляется при взаимодействии",
    },
    {
      icon: "❄",
      name: "Заморозка",
      desc: "Останавливает движение элементов",
      effect: `${RareEventsConfig.freezeDuration / 1000} сек`,
      note: "В 3 уровне срабатывает с задержкой",
    },
  ];

  rows.forEach((r) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><b>${r.icon} ${r.name}</b></td>
      <td>${r.desc}</td>
      <td>${r.effect}</td>
      <td><small>${r.note}</small></td>
    `;

    tbody.appendChild(tr);
  });
}

function renderRulesTable() {
  const tbody = document.getElementById("rules-table-body");
  if (!tbody || typeof DifficultyConfig === "undefined") return;

  tbody.innerHTML = "";

  const difficultyNames = {
    easy: "Лёгкая",
    medium: "Средняя",
    hard: "Сложная",
  };

  const baseReward = 20;
  const basePenalty = 10;

  Object.entries(DifficultyConfig).forEach(([key, cfg]) => {
    const reward = Math.round(baseReward * cfg.scoreMultiplier);
    const penalty = Math.round(basePenalty * cfg.penaltyMultiplier);

    const tr = document.createElement("tr");
    tr.classList.add("difficulty-row", `difficulty-${key}`);

    tr.innerHTML = `
      <td><b>${difficultyNames[key]}</b></td>
      <td>${cfg.timeLimit} сек</td>
      <td class="points-plus">+${reward}</td>
      <td class="points-minus">−${penalty}</td>
    `;

    tbody.appendChild(tr);
  });
}
