(() => {
  const $ = id => document.getElementById(id);
  const scoreDisplay   = $("score-display");
  const listSelect     = $("list-select");
  const progressFill   = $("progress-fill");
  const phraseEn       = $("phrase-en");
  const hintBtn        = $("hint-btn");
  const hintText       = $("hint-text");
  const input          = $("answer-input");
  const feedback       = $("feedback");
  const actionBtn      = $("action-btn");
  const overlay        = $("overlay");
  const overlayIcon    = $("overlay-icon");
  const overlayTitle   = $("overlay-title");
  const overlayBody    = $("overlay-body");
  const overlayPrimary = $("overlay-primary");
  const overlaySec     = $("overlay-secondary");

  const ROUND_SIZE = 20;
  let queue = [], idx = 0, missed = [], round = 1;
  let score = { correct: 0, total: 0 }, answered = false;

  const norm = s => s.trim().toLowerCase().replace(/[.,!?]+$/, "");

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRound(pool) {
    return shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length));
  }

  function currentList() {
    return PHRASE_LISTS.find(l => l.id === listSelect.value);
  }

  function renderCard() {
    const phrase = queue[idx];
    answered = false;

    progressFill.style.width = `${(idx / queue.length) * 100}%`;

    const roundLabel = round > 1 ? `round ${round} · ` : "";
    const scoreLabel = score.total > 0 ? `${score.correct}/${score.total} · ` : "";
    scoreDisplay.textContent = `${roundLabel}${scoreLabel}${idx + 1}/${queue.length}`;

    phraseEn.textContent = phrase.en;

    hintBtn.textContent = "▸ hint";
    hintText.textContent = phrase.hint || "";
    hintText.classList.add("hidden");
    phrase.hint ? hintBtn.classList.remove("hidden") : hintBtn.classList.add("hidden");

    input.value = "";
    input.disabled = false;
    input.className = "";
    input.focus();

    feedback.textContent = "";
    feedback.className = "feedback hidden";

    actionBtn.textContent = "Check (Enter)";
    actionBtn.className = "";
    actionBtn.disabled = false;
  }

  function renderResult(correct) {
    const phrase = queue[idx];
    input.disabled = true;
    input.classList.add(correct ? "correct" : "incorrect");

    feedback.classList.remove("hidden");
    feedback.classList.add(correct ? "correct" : "incorrect");
    if (correct) {
      feedback.textContent = "✓ Correct!";
    } else {
      const alts = phrase.answers.slice(1);
      feedback.innerHTML = `✗ Incorrect. Accepted: <strong>${phrase.answers[0]}</strong>`
        + (alts.length ? ` or <strong>${alts.join(", ")}</strong>` : "");
    }

    actionBtn.textContent = "Next (Enter) →";
    actionBtn.classList.add("next");
  }

  function showOverlay(perfect) {
    overlayIcon.textContent  = perfect ? "🎉" : "🔁";
    overlayTitle.textContent = `Round ${round} complete`;
    overlayBody.textContent  = `${score.correct}/${score.total} correct`
      + (perfect ? "" : ` · ${missed.length} to retry`);

    overlayPrimary.textContent = perfect ? "New random round" : `Retry missed (${missed.length})`;
    overlayPrimary.onclick     = perfect ? newRound : retryMissed;

    if (perfect) {
      overlaySec.classList.add("hidden");
    } else {
      overlaySec.textContent = "New random round";
      overlaySec.onclick     = newRound;
      overlaySec.classList.remove("hidden");
    }

    overlay.classList.remove("hidden");
  }

  function check() {
    if (!input.value.trim() || answered) return;
    const phrase  = queue[idx];
    const correct = phrase.answers.some(a => norm(a) === norm(input.value));
    answered = true;
    score.total++;
    if (correct) score.correct++; else missed.push(phrase);
    renderResult(correct);
  }

  function next() {
    if (idx + 1 >= queue.length) showOverlay(missed.length === 0);
    else { idx++; renderCard(); }
  }

  function retryMissed() {
    queue = pickRound(missed);
    missed = []; idx = 0; round++;
    score = { correct: 0, total: 0 };
    overlay.classList.add("hidden");
    renderCard();
  }

  function newRound() {
    queue = pickRound(currentList().phrases);
    missed = []; idx = 0; round = 1;
    score = { correct: 0, total: 0 };
    overlay.classList.add("hidden");
    renderCard();
  }

  document.querySelectorAll(".char-btn").forEach(btn => {
    btn.addEventListener("mousedown", e => {
      e.preventDefault(); // keep focus on input
      if (input.disabled) return;
      const ch  = btn.textContent;
      const start = input.selectionStart;
      const end   = input.selectionEnd;
      input.value = input.value.slice(0, start) + ch + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + ch.length;
      input.focus();
    });
  });

  actionBtn.addEventListener("click", () => answered ? next() : check());

  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && overlay.classList.contains("hidden")) {
      e.preventDefault();
      answered ? next() : check();
    }
  });

  hintBtn.addEventListener("click", () => {
    const hidden = hintText.classList.toggle("hidden");
    hintBtn.textContent = hidden ? "▸ hint" : "▾ hint";
  });

  listSelect.addEventListener("change", newRound);

  PHRASE_LISTS.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.label;
    listSelect.appendChild(opt);
  });

  newRound();
})();