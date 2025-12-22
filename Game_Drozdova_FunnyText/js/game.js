const DifficultyConfig = {
  easy: {
    timeLimit: 80,
    scoreMultiplier: 1.2,
    penaltyMultiplier: 0.5,
    fallSpeed: 1,
    itemsMultiplier: 0.8,
    moveSpeed: 0.7,
    questionsPerLevel: 3,
  },
  medium: {
    timeLimit: 60,
    scoreMultiplier: 1,
    penaltyMultiplier: 1,
    fallSpeed: 2,
    itemsMultiplier: 1,
    moveSpeed: 1.2,
    questionsPerLevel: 4,
  },
  hard: {
    timeLimit: 40,
    scoreMultiplier: 0.8,
    penaltyMultiplier: 1.5,
    fallSpeed: 3,
    itemsMultiplier: 1.3,
    moveSpeed: 1.8,
    questionsPerLevel: 5,
  },
};

const RareEventsConfig = {
  chance: 0.1,
  freezeDuration: 3000,

  baseGoldBonus: 20,
  baseTrapPenalty: 10,
};

function getRandomRareEvent() {
  if (Math.random() > RareEventsConfig.chance) return null;

  const events = ["gold", "freeze", "trap"];
  return events[Math.floor(Math.random() * events.length)];
}

function triggerFreeze() {
  Game.state.isFrozen = true;
  showEventMessage("❄ Все элементы заморожены!");

  setTimeout(() => {
    Game.state.isFrozen = false;
  }, RareEventsConfig.freezeDuration);
}

function showEventMessage(text) {
  const msg = document.createElement("div");
  msg.className = "event-toast";
  msg.innerText = text;
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 2000);
}

function getGoldBonus() {
  const cfg = Game.state.difficultyConfig || DifficultyConfig.medium;
  return Math.round(
    RareEventsConfig.baseGoldBonus * cfg.scoreMultiplier
  );
}

function getTrapPenalty() {
  const cfg = Game.state.difficultyConfig || DifficultyConfig.medium;
  return Math.round(
    RareEventsConfig.baseTrapPenalty * cfg.penaltyMultiplier
  );
}

const Game = {
  state: {
    currentLevel: 1,
    score: 0,
    playerName: "",
    timeLeft: 0,
    timerId: null,
    subLevelCount: 0, // Счетчик пройденных вопросов внутри уровня
    difficulty: "medium",
    difficultyConfig: null,
    level1QuestionsQueue: [],
    level2QuestionsQueue: [],
    level3WordsQueue: [],
    isGameOver: false,
    useTimer: true,
    isFrozen: false,
  },

  difficultyLabels: {
    easy: "Лёгкая",
    medium: "Средняя",
    hard: "Сложная",
  },

  config: {
    questionsPerLevel: 3, // Минимум вопросов на уровне
    timeLimit: 60, // Секунд на уровень
  },

  // Инициализация кнопок
  init() {
    document.getElementById("btn-leaders").addEventListener("click", () => {
      this.showScreen("screen-leaders");
      this.renderRatings("rating-list-leaders");
    });

    document
      .getElementById("btn-clear-rating")
      ?.addEventListener("click", () => this.clearLeaders());

    document.getElementById("btn-start").addEventListener("click", () => {
      const name = document.getElementById("username").value;
      if (!name) return alert("Введите имя!");

      this.state.playerName = name;

      const theme = document.getElementById("theme-select").value;
      document.body.className = `theme-${theme}`;

      const difficulty = document.getElementById("difficulty-select").value;
      this.state.difficulty = difficulty;
      this.state.difficultyConfig = DifficultyConfig[difficulty];
      this.state.useTimer = document.getElementById("use-timer").checked;

      this.config.timeLimit = this.state.difficultyConfig.timeLimit;
      this.config.questionsPerLevel =
        this.state.difficultyConfig.questionsPerLevel;

      this.showScreen("screen-game");
      this.startLevel(1);
    });
  },

  showScreen(id) {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  },

  startLevel(level) {
    this.state.currentLevel = level;
    this.state.subLevelCount = 0;
    this.state.timeLeft = this.config.timeLimit;
    document.getElementById("hud-time").innerText = this.state.timeLeft;
    this.state.subLevelCount = 0;
    document.getElementById(
      "hud-progress"
    ).innerText = `0 / ${this.config.questionsPerLevel}`;

    if (this.state.useTimer) {
      this.state.timeLeft = this.config.timeLimit;
      document.getElementById("hud-time").innerText = this.state.timeLeft;
      this.startTimer();
    } else {
      // если таймера нет — убираем отображение
      document.getElementById("hud-time").innerText = "∞";
    }
    document.getElementById("hud-level").innerText = level;
    document.getElementById("hud-name").innerText = this.state.playerName;

    const diffEl = document.getElementById("hud-difficulty");
    diffEl.innerText = this.difficultyLabels[this.state.difficulty];
    diffEl.className = `difficulty-${this.state.difficulty}`;

    if (level === 1) {
      this.state.level1QuestionsQueue = GameData.level1.questions
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, this.config.questionsPerLevel);
    }

    if (level === 2) {
      this.state.level2QuestionsQueue = GameData.level2.questions
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, this.config.questionsPerLevel);
    }

    if (level === 3) {
      this.state.level3WordsQueue = GameData.level3.words
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, this.config.questionsPerLevel);
    }

    this.startTimer();
    this.nextTask();
  },

  nextTask() {
    const gameArea = document.getElementById("game-area");
    const taskText = document.getElementById("task-description");
    const rareEvent = getRandomRareEvent();

    // Проверка завершения уровня
    if (this.state.subLevelCount >= this.config.questionsPerLevel) {
      if (this.state.currentLevel < 3) {
        alert(`Уровень ${this.state.currentLevel} пройден!`);
        this.startLevel(this.state.currentLevel + 1);
      } else {
        this.finishGame();
      }
      return;
    }

    // Логика выбора уровня
    if (this.state.currentLevel === 1) {
      if (this.state.level1QuestionsQueue.length === 0) {
        this.finishLevel();
        return;
      }
      const q = this.state.level1QuestionsQueue.shift();
      taskText.innerText = q.text;
      Mechanics.initLevel1(
        gameArea,
        q,
        (points, success) => this.addScore(points, success),
        (points) => this.addScore(-points, false),
        rareEvent
      );
    } else if (this.state.currentLevel === 2) {
      const q = this.state.level2QuestionsQueue[this.state.subLevelCount];
      taskText.innerText = q.text;
      Mechanics.initLevel2(
        gameArea,
        q,
        (points, success) => this.addScore(points, success),
        (points) => this.addScore(-points, false),
        rareEvent
      );
    } else if (this.state.currentLevel === 3) {
      if (this.state.level3WordsQueue.length === 0) {
        this.finishGame();
        return;
      }

      const word = this.state.level3WordsQueue.shift();
      taskText.innerText = `Напечатай слово: ${word}`;

      Mechanics.initLevel3(
        gameArea,
        word,
        (points, success) => this.addScore(points, success),
        (points) => this.addScore(-points, false),
        rareEvent
      );
    }
  },

  addScore(amount, isSuccess) {
    // если игра уже закончена — ничего не делаем
    if (this.state.isGameOver) return;
    const cfg = this.state.difficultyConfig;
    const finalAmount =
      amount > 0
        ? amount * cfg.scoreMultiplier
        : amount * cfg.penaltyMultiplier;

    this.state.score += Math.round(finalAmount);

    document.getElementById("hud-score").innerText = this.state.score;

    if (isSuccess) {
      this.state.subLevelCount++;
      document.getElementById(
        "hud-progress"
      ).innerText = `${this.state.subLevelCount} / ${this.config.questionsPerLevel}`;

      if (this.state.subLevelCount >= this.config.questionsPerLevel) {
        if (this.state.currentLevel < 3) {
          this.startLevel(this.state.currentLevel + 1);
        } else {
          this.finishGame();
        }
      } else {
        setTimeout(() => this.nextTask(), 400);
      }
    }

    // Проверка проигрыша по баллам
    if (this.state.score < -50) {
      alert("Слишком много ошибок!");
      this.finishGame();
    }
  },

  startTimer() {
    if (!this.state.useTimer) return;
    if (this.state.timerId) clearInterval(this.state.timerId);

    this.state.timerId = setInterval(() => {
      this.state.timeLeft--;
      document.getElementById("hud-time").innerText = this.state.timeLeft;

      if (this.state.timeLeft <= 0) {
        clearInterval(this.state.timerId);
        alert("Время вышло!");
        this.finishGame();
      }
    }, 1000);
  },

  finishLevel() {
    // Возможность завершить уровень досрочно (но не игру)
    if (confirm("Выйти в меню? Прогресс будет потерян.")) {
      location.reload();
    }
  },

  // DEBUG ФУНКЦИЯ
  debugSkipLevel() {
    clearInterval(this.state.timerId);
    if (this.state.currentLevel < 3) {
      this.startLevel(this.state.currentLevel + 1);
    } else {
      this.finishGame();
    }
  },

  finishGame() {
    if (this.state.isGameOver) return;

    this.state.isGameOver = true;
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }
    this.showScreen("screen-result");
    document.getElementById("final-score").innerText = this.state.score;

    Storage.saveScore(this.state.playerName, this.state.score);
    this.renderRatings("rating-list-final");
  },

  clearLeaders() {
    if (!confirm("Очистить всю таблицу лидеров?")) return;
    Storage.clearRatings();
    this.renderRatings("rating-list-final");
    this.renderRatings("rating-list-leaders");
  },

  renderRatings(targetId) {
    const list = document.getElementById(targetId);
    if (!list) return;

    list.innerHTML = "";
    const data = Storage.getRatings();

    if (data.length === 0) {
      const li = document.createElement("li");
      li.innerText = "Пока нет результатов";
      list.appendChild(li);
      return;
    }

    let currentMarked = false;

    data.forEach((r, i) => {
      const li = document.createElement("li");
      li.innerText = `${i + 1}. ${r.name} — ${r.score} баллов`;

      // ТОП-3
      if (i === 0) li.classList.add("leader-1");
      if (i === 1) li.classList.add("leader-2");
      if (i === 2) li.classList.add("leader-3");
      if (
        !currentMarked &&
        r.name === this.state.playerName &&
        r.score === this.state.score
      ) {
        li.classList.add("current-player");
        currentMarked = true;
      }

      list.appendChild(li);
    });
  },
};

// Запуск при загрузке
window.onload = () => Game.init();
