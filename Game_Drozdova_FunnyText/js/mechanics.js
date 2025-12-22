const Mechanics = {
  // === УРОВЕНЬ 1: Двойной клик ===
  initLevel1(container, questionData, onScore, onMistake) {
    container.innerHTML = "";

    const allItems = GameData.level1.items.slice();

    const correctItems = allItems.filter((item) =>
      item.tags.includes(questionData.type)
    );

    const wrongItems = allItems.filter(
      (item) => !item.tags.includes(questionData.type)
    );

    const difficulty = Game.state.difficulty;

    let correctCount;
    let wrongCount;

    switch (difficulty) {
      case "easy":
        correctCount = 2;
        wrongCount = 4;
        break;
      case "medium":
        correctCount = 3;
        wrongCount = 6;
        break;
      case "hard":
        correctCount = 4;
        wrongCount = 8;
        break;
    }

    const selectedCorrect = correctItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(correctCount, correctItems.length));

    const selectedWrong = wrongItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(wrongCount, wrongItems.length));

    const items = [...selectedCorrect, ...selectedWrong].sort(
      () => Math.random() - 0.5
    );

    // считаем ТОЛЬКО показанные правильные
    let remainingCorrect = selectedCorrect.length;
    let completed = false;

    items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "game-item";
      el.innerText = item.name;

      el.style.left = Math.random() * 700 + "px";
      el.style.top = Math.random() * 400 + "px";

      const speed = Game.state.difficultyConfig.moveSpeed;
      this.animateFloating(el, speed);

      el.addEventListener("dblclick", () => {
        if (el.dataset.used === "true") return;

        const isCorrect = item.tags.includes(questionData.type);

        if (isCorrect) {
          el.dataset.used = "true";
          el.style.background = "#81C784";
          el.style.pointerEvents = "none";

          remainingCorrect--;
          onScore(10, false); // баллы без перехода

          // переход ТОЛЬКО когда выбраны ВСЕ
          if (remainingCorrect === 0 && !completed) {
            completed = true;
            setTimeout(() => {
              onScore(0, true); 
            }, 400);
          }
        } else {
          el.classList.add("error-anim");
          onMistake(5);
        }
      });

      container.appendChild(el);
    });
  },

  animateFloating(el, speed = 1) {
    let x = parseFloat(el.style.left);
    let y = parseFloat(el.style.top);
    let dx = (Math.random() - 0.5) * 2 * speed;
    let dy = (Math.random() - 0.5) * 2 * speed;
    const move = () => {
      if (!document.contains(el)) return;
      x += dx;
      y += dy;
      if (x <= 0 || x >= 720) dx = -dx;
      if (y <= 0 || y >= 450) dy = -dy;
      el.style.left = x + "px";
      el.style.top = y + "px";
      requestAnimationFrame(move);
    };
    requestAnimationFrame(move);
  },

  // === УРОВЕНЬ 2: Drag & Drop ===
  initLevel2(container, questionData, onScore, onMistake) {
    container.innerHTML = "";

    const difficulty = Game.state.difficulty;

    // ЗОНА СБРОСА
    const zone = document.createElement("div");
    zone.className = "drop-zone";
    zone.innerText = "Сюда!";
    container.appendChild(zone);

    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("active");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("active");
    });

    // ОТБОР ПРЕДМЕТОВ
    const allItems = GameData.level2.items.slice();

    const correctItems = allItems.filter(
      (item) =>
        item.type === questionData.target ||
        (item.tags || []).includes(questionData.target)
    );

    const wrongItems = allItems.filter(
      (item) =>
        item.type !== questionData.target &&
        !(item.tags || []).includes(questionData.target)
    );

    let correctCount;
    let wrongCount;

    switch (difficulty) {
      case "easy":
        correctCount = 2;
        wrongCount = 6;
        break;

      case "medium":
        correctCount = 3;
        wrongCount = 8;
        break;

      case "hard":
        correctCount = 4;
        wrongCount = 10;
        break;

      default:
        correctCount = 3;
        wrongCount = 8;
    }

    const selectedCorrect = correctItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(correctCount, correctItems.length));

    let remainingCorrect = selectedCorrect.length;

    const selectedWrong = wrongItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(wrongCount, wrongItems.length));

    const items = [...selectedCorrect, ...selectedWrong].sort(
      () => Math.random() - 0.5
    );

    let completed = false;

    // ===== DROP =====
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("active");

      const id = e.dataTransfer.getData("id");
      const type = e.dataTransfer.getData("type");
      const tags = JSON.parse(e.dataTransfer.getData("tags") || "[]");
      const el = document.getElementById(id);

      if (!el || completed) return;

      const isCorrect =
        type === questionData.target || tags.includes(questionData.target);

      if (isCorrect) {
        el.remove();
        remainingCorrect--;

        if (remainingCorrect === 0) {
          completed = true;
          onScore(20); // переход к следующему вопросу
        }
      } else {
        onMistake(10);
      }
    });

    // ===== СЕТКА =====
    const positions = [];
    const cols = 5;
    const rows = 3;
    const cellW = 140;
    const cellH = 90;
    const startX = 40;
    const startY = 40;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions.push({
          x: startX + c * cellW,
          y: startY + r * cellH,
        });
      }
    }

    positions.sort(() => Math.random() - 0.5);

    items.forEach((item, index) => {
      const el = document.createElement("div");
      el.className = "game-item";
      el.innerText = item.name;
      el.id = "drag-" + index;
      el.draggable = true;

      el.style.left = positions[index].x + "px";
      el.style.top = positions[index].y + "px";

      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("id", el.id);
        e.dataTransfer.setData("type", item.type);
        e.dataTransfer.setData("tags", JSON.stringify(item.tags || []));
      });

      // HARD — элементы слегка двигаются
      if (difficulty === "hard") {
        Mechanics.animateFloating(el, 0.7);
      }

      container.appendChild(el);
    });
  },

  // === УРОВЕНЬ 3: Клавиатура и падение ===
  initLevel3(container, word, onScore, onMistake) {
    container.innerHTML = "";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Печатай здесь...";
    input.style.position = "absolute";
    input.style.bottom = "10px";
    input.style.left = "300px";
    input.focus();
    container.appendChild(input);

    let activeWord = word;
    let activeEl = null;

    const spawnWord = () => {
      if (activeEl) return;

      activeEl = document.createElement("div");
      activeEl.className = "game-item falling-item";
      activeEl.innerText = activeWord;
      activeEl.style.left = Math.random() * 600 + "px";
      activeEl.style.top = "-50px";
      container.appendChild(activeEl);

      let top = -50;

      const fall = setInterval(() => {
        if (!document.contains(activeEl)) {
          clearInterval(fall);
          return;
        }

        top += Game.state.difficultyConfig.fallSpeed;
        activeEl.style.top = top + "px";

        if (top > 450) {
          clearInterval(fall);
          activeEl.remove();
          activeEl = null;
          input.value = "";

          onMistake(20);

          // запускаем следующий вопрос
          setTimeout(() => {
            onScore(0, false); // без засчёта, но с переходом
          }, 300);
        }
      }, 20);
    };

    spawnWord();

    input.addEventListener("input", () => {
      if (!activeEl) return;

      if (input.value.toLowerCase().trim() === activeWord) {
        activeEl.remove();
        activeEl = null;
        input.value = "";

        onScore(20, true); // засчитали + следующий вопрос
      }
    });
  },
};
