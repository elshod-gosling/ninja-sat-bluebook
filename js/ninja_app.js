// DIGITAL SAT READING & WRITING SUITE (270 QUESTIONS)
// OFFICIAL 200-800 SCALED EQUATING TABLE (0 to 54 raw correct -> 200 to 800)
const SAT_SCALED_CURVE = [
  200, 210, 220, 230, 240, 260, 280, 290, 310, 320, // 0-9
  330, 340, 350, 360, 370, 380, 390, 400, 410, 420, // 10-19
  430, 440, 450, 460, 470, 480, 490, 500, 510, 520, // 20-29
  530, 540, 550, 560, 570, 580, 590, 600, 610, 620, // 30-39
  630, 640, 650, 660, 670, 680, 690, 700, 720, 730, // 40-49
  750, 770, 780, 790, 800                            // 50-54
];

// TEST SESSION STATE
let activeQuestions = [];
let currentSubsetIdx = 0;

let satExamState = {
  isActive: false,
  variantNum: 1,
  currentModule: 1, // 1 or 2
  timerSeconds: 32 * 60,
  timerRunning: true,
  isUntimed: false
};

// GENERAL STATE
let mode = localStorage.getItem('sat_mode') || 'practice';
let answers = JSON.parse(localStorage.getItem('sat_answers') || '{}');
let checkedQuestions = JSON.parse(localStorage.getItem('sat_checked') || '{}');
let flags = JSON.parse(localStorage.getItem('sat_flags') || '{}');
let eliminations = JSON.parse(localStorage.getItem('sat_eliminations') || '{}');
let highlights = JSON.parse(localStorage.getItem('sat_highlights') || '{}');

let timerInterval = null;

// DOM REFS
let homeHubView, testArenaView, backToHubBtn, resumeBanner, resumeSubtitle, statFullProgress, statFullBar;
let passagePane, questionPane, passageBody, chartContainer, chartImg, domainTag, qNumBox, moduleName, flagBtn;
let questionStem, optionsList, checkAnswerRow, checkAnswerBtn, ansFeedbackTag, explanationCard, explanationText;
let currentQNum, totalActiveQNum, prevBtn, nextBtn, navModalBackdrop, paletteGrid, resultsModalBackdrop, moduleTransitionModal;
let modePracticeBtn, modeTestBtn, modeUntimedBtn, hubModePractice, hubModeTest, hubModeUntimed;
let timerBox, timerText, timerToggleBtn, timerHideBtn;

function initDomRefs() {
  homeHubView = document.getElementById('homeHubView');
  testArenaView = document.getElementById('testArenaView');
  backToHubBtn = document.getElementById('backToHubBtn');
  resumeBanner = document.getElementById('resumeBanner');
  resumeSubtitle = document.getElementById('resumeSubtitle');
  statFullProgress = document.getElementById('statFullProgress');
  statFullBar = document.getElementById('statFullBar');

  passagePane = document.getElementById('passagePane');
  questionPane = document.getElementById('questionPane');
  passageBody = document.getElementById('passageBody');
  chartContainer = document.getElementById('chartContainer');
  chartImg = document.getElementById('chartImg');
  domainTag = document.getElementById('domainTag');
  qNumBox = document.getElementById('qNumBox');
  moduleName = document.getElementById('moduleName');
  flagBtn = document.getElementById('flagBtn');
  questionStem = document.getElementById('questionStem');
  optionsList = document.getElementById('optionsList');
  checkAnswerRow = document.getElementById('checkAnswerRow');
  checkAnswerBtn = document.getElementById('checkAnswerBtn');
  ansFeedbackTag = document.getElementById('ansFeedbackTag');
  explanationCard = document.getElementById('explanationCard');
  explanationText = document.getElementById('explanationText');
  currentQNum = document.getElementById('currentQNum');
  totalActiveQNum = document.getElementById('totalActiveQNum');
  prevBtn = document.getElementById('prevBtn');
  nextBtn = document.getElementById('nextBtn');
  navModalBackdrop = document.getElementById('navModalBackdrop');
  paletteGrid = document.getElementById('paletteGrid');
  resultsModalBackdrop = document.getElementById('resultsModalBackdrop');
  moduleTransitionModal = document.getElementById('moduleTransitionModal');

  modePracticeBtn = document.getElementById('modePracticeBtn');
  modeTestBtn = document.getElementById('modeTestBtn');
  modeUntimedBtn = document.getElementById('modeUntimedBtn');
  hubModePractice = document.getElementById('hubModePractice');
  hubModeTest = document.getElementById('hubModeTest');
  hubModeUntimed = document.getElementById('hubModeUntimed');

  timerBox = document.getElementById('timerBox');
  timerText = document.getElementById('timerText');
  timerToggleBtn = document.getElementById('timerToggleBtn');
  timerHideBtn = document.getElementById('timerHideBtn');
}

// APP INITIALIZATION
function init() {
  initDomRefs();
  initTheme();

  // Ensure scroll-reveal elements are 100% visible immediately
  initScrollAnimations();

  if (typeof ALL_QUESTIONS !== 'undefined' && ALL_QUESTIONS.length > 0) {
    activeQuestions = ALL_QUESTIONS;
  }

  setMode(mode);
  updateHubProgress();
  init2DHero();
  setupEvents();
  setupHighlighter();
}

// THEME TOGGLE
function initTheme() {
  const saved = localStorage.getItem('sat_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sat_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(t) {
  const btn1 = document.getElementById('themeBtn');
  const btn2 = document.getElementById('themeBtnNav');
  const icon = t === 'dark' ? '🌙' : '☀️';
  if (btn1) btn1.textContent = icon;
  if (btn2) btn2.textContent = icon;
}

// SCROLL ANIMATIONS (Guaranteed immediate visibility)
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-reveal');
  elements.forEach(el => {
    el.classList.add('revealed');
    el.classList.add('visible');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          e.target.classList.add('visible');
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });

    elements.forEach(el => observer.observe(el));
  }
}

// UPDATE HUB PROGRESS
function updateHubProgress() {
  if (typeof ALL_QUESTIONS === 'undefined' || !ALL_QUESTIONS.length) return;

  const total = ALL_QUESTIONS.length;
  let answeredTotal = 0;

  for (let i = 1; i <= 5; i++) {
    const vQs = ALL_QUESTIONS.filter(q => q.variant_num === i);
    let vAnswered = 0;
    vQs.forEach(q => {
      if (answers[q.id] !== undefined) {
        vAnswered++;
        answeredTotal++;
      }
    });
    const progEl = document.getElementById(`progV${i}`);
    const barEl = document.getElementById(`barV${i}`);
    if (progEl) progEl.textContent = `${vAnswered} / ${vQs.length || 54} Answered`;
    if (barEl) barEl.style.width = `${Math.round((vAnswered / (vQs.length || 54)) * 100)}%`;
  }

  if (statFullProgress) statFullProgress.textContent = `${answeredTotal} / ${total} Answered`;
  if (statFullBar) statFullBar.style.width = `${Math.round((answeredTotal / total) * 100)}%`;

  // Domain Counts
  const domains = [
    { name: 'Craft and Structure', id: 'domainCount1' },
    { name: 'Information and Ideas', id: 'domainCount2' },
    { name: 'Standard English Conventions', id: 'domainCount3' },
    { name: 'Expression of Ideas', id: 'domainCount4' }
  ];
  domains.forEach(d => {
    const c = ALL_QUESTIONS.filter(q => q.domain === d.name).length;
    const el = document.getElementById(d.id);
    if (el) el.textContent = `${c} Questions`;
  });

  // Resume Banner
  const lastQ = localStorage.getItem('sat_last_q');
  if (lastQ !== null && answeredTotal > 0 && answeredTotal < total) {
    if (resumeBanner) resumeBanner.style.display = 'flex';
    if (resumeSubtitle) resumeSubtitle.textContent = `Question ${parseInt(lastQ) + 1} of ${total} • ${answeredTotal} questions completed so far.`;
  } else {
    if (resumeBanner) resumeBanner.style.display = 'none';
  }
}

// RESET ALL PROGRESS
function resetAllProgress() {
  const answeredCount = Object.keys(answers).length;
  const msg = answeredCount > 0
    ? `Are you sure you want to remove all progress? This will clear all ${answeredCount} answered questions, saved flags, highlights, and eliminations. This action cannot be undone.`
    : 'Are you sure you want to reset all test progress, saved answers, and flags?';

  if (!confirm(msg)) {
    return;
  }

  answers = {};
  checkedQuestions = {};
  flags = {};
  eliminations = {};
  highlights = {};

  localStorage.removeItem('sat_answers');
  localStorage.removeItem('sat_checked');
  localStorage.removeItem('sat_flags');
  localStorage.removeItem('sat_eliminations');
  localStorage.removeItem('sat_highlights');
  localStorage.removeItem('sat_last_q');

  if (resultsModalBackdrop) resultsModalBackdrop.classList.remove('show');
  if (navModalBackdrop) navModalBackdrop.classList.remove('show');
  if (moduleTransitionModal) moduleTransitionModal.classList.remove('show');

  updateHubProgress();

  if (testArenaView && testArenaView.style.display === 'flex') {
    renderQuestion(currentSubsetIdx);
  }

  triggerEasterEgg('toast', '🗑️ All progress and saved answers have been reset.');
}
window.resetAllProgress = resetAllProgress;

// VIEW SWITCHING
function showHub() {
  clearInterval(timerInterval);
  satExamState.timerRunning = false;
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  if (homeHubView) {
    homeHubView.style.display = 'flex';
    homeHubView.style.flexDirection = 'column';
  }
  if (testArenaView) testArenaView.style.display = 'none';
  updateHubProgress();
  initScrollAnimations();
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  if (typeof resume2DCanvas === 'function') resume2DCanvas();
}

function showArena() {
  if (typeof pause2DCanvas === 'function') pause2DCanvas();
  if (homeHubView) homeHubView.style.display = 'none';
  if (testArenaView) {
    testArenaView.style.display = 'flex';
    testArenaView.style.flexDirection = 'column';
  }
  window.scrollTo(0, 0);
}

// START EXAM (Timed or Untimed)
function startSatExam(vNum, isUntimed = false) {
  if (typeof ALL_QUESTIONS === 'undefined' || !ALL_QUESTIONS.length) {
    console.error('ALL_QUESTIONS not loaded');
    return;
  }

  satExamState.isActive = true;
  satExamState.variantNum = vNum;
  satExamState.currentModule = 1;
  satExamState.isUntimed = isUntimed || (mode === 'untimed');
  satExamState.timerSeconds = 32 * 60;
  satExamState.timerRunning = !satExamState.isUntimed;

  if (satExamState.isUntimed) {
    setMode('untimed');
  } else {
    setMode('test');
  }

  // Load Version V Module 1 (Q1-27)
  const vQs = ALL_QUESTIONS.filter(q => q.variant_num === vNum && q.module === 'Module 1');
  activeQuestions = vQs;
  currentSubsetIdx = 0;

  const badgeText = `Version ${vNum} • Mod 1 (27 Qs)${satExamState.isUntimed ? ' [Untimed]' : ''}`;
  document.getElementById('arenaBadge').textContent = badgeText;
  totalActiveQNum.textContent = activeQuestions.length;

  if (!satExamState.isUntimed) {
    startTimerCountdown();
  } else {
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
  }

  showArena();
  renderQuestion(0);
}

// PROCEED TO MODULE 2
function proceedToModule2() {
  satExamState.currentModule = 2;
  satExamState.timerSeconds = 32 * 60;
  satExamState.timerRunning = !satExamState.isUntimed;

  moduleTransitionModal.classList.remove('show');

  const vQs = ALL_QUESTIONS.filter(q => q.variant_num === satExamState.variantNum && q.module === 'Module 2');
  activeQuestions = vQs;
  currentSubsetIdx = 0;

  const badgeText = `Version ${satExamState.variantNum} • Mod 2 (27 Qs)${satExamState.isUntimed ? ' [Untimed]' : ''}`;
  document.getElementById('arenaBadge').textContent = badgeText;
  totalActiveQNum.textContent = activeQuestions.length;

  if (!satExamState.isUntimed) {
    startTimerCountdown();
  } else {
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
  }

  renderQuestion(0);
}

// SHOW MODULE TRANSITION BREAK
function showModuleTransition() {
  clearInterval(timerInterval);
  satExamState.timerRunning = false;

  const mod1Qs = ALL_QUESTIONS.filter(q => q.variant_num === satExamState.variantNum && q.module === 'Module 1');
  let answered = 0;
  let flagged = 0;
  mod1Qs.forEach(q => {
    if (answers[q.id] !== undefined) answered++;
    if (flags[q.id]) flagged++;
  });

  document.getElementById('transAnsweredCount').textContent = answered;
  document.getElementById('transUnansweredCount').textContent = mod1Qs.length - answered;
  document.getElementById('transFlaggedCount').textContent = flagged;

  document.getElementById('transModuleTitle').textContent = 'Section 1: Module 1 Complete!';
  const timerNote = satExamState.isUntimed ? 'Begin Module 2 (Untimed) →' : 'Begin Module 2 (32 min) →';
  document.getElementById('transStartMod2Btn').textContent = timerNote;
  document.getElementById('transModuleDesc').textContent = 'You have completed Module 1 (27 Questions). In the official SAT, you cannot return to Module 1 questions once you proceed. Take a moment to relax before beginning Module 2.';

  moduleTransitionModal.classList.add('show');
}

// START PRACTICE VOLUME (Full suite, Version 1-5, or Domain)
function startPracticeVolume(volKey, subKey = '') {
  if (typeof ALL_QUESTIONS === 'undefined' || !ALL_QUESTIONS.length) {
    console.error('ALL_QUESTIONS not loaded');
    return;
  }

  satExamState.isActive = false;
  satExamState.isUntimed = (mode === 'untimed');

  if (volKey === 'all') {
    activeQuestions = ALL_QUESTIONS;
    document.getElementById('arenaBadge').textContent = '270 Questions';
  } else if (volKey.startsWith('variant') || volKey.startsWith('version')) {
    const vNum = parseInt(volKey.replace('variant', '').replace('version', ''));
    const vQs = ALL_QUESTIONS.filter(q => q.variant_num === vNum);
    if (subKey === 'm1') {
      activeQuestions = vQs.filter(q => q.module === 'Module 1');
      document.getElementById('arenaBadge').textContent = `Version ${vNum} • M1 (27 Qs)`;
    } else if (subKey === 'm2') {
      activeQuestions = vQs.filter(q => q.module === 'Module 2');
      document.getElementById('arenaBadge').textContent = `Version ${vNum} • M2 (27 Qs)`;
    } else {
      activeQuestions = vQs;
      document.getElementById('arenaBadge').textContent = `Version ${vNum} (54 Qs)`;
    }
  } else {
    activeQuestions = ALL_QUESTIONS.filter(q => q.category === volKey || q.domain === volKey);
    document.getElementById('arenaBadge').textContent = `${volKey} (${activeQuestions.length})`;
  }

  totalActiveQNum.textContent = activeQuestions.length;
  currentSubsetIdx = 0;

  if (mode === 'test' && !satExamState.isUntimed) {
    satExamState.timerSeconds = Math.round(activeQuestions.length * 71.1);
    startTimerCountdown();
  } else if (mode === 'untimed' || satExamState.isUntimed) {
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
  } else {
    initStopwatch();
  }

  showArena();
  renderQuestion(0);
}

// RESUME PRACTICE
function resumePractice() {
  const lastQ = parseInt(localStorage.getItem('sat_last_q') || '0');
  activeQuestions = ALL_QUESTIONS;
  currentSubsetIdx = Math.min(lastQ, activeQuestions.length - 1);
  totalActiveQNum.textContent = activeQuestions.length;
  document.getElementById('arenaBadge').textContent = 'Master Suite';

  if (mode === 'untimed') {
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
  } else {
    initStopwatch();
  }

  showArena();
  renderQuestion(currentSubsetIdx);
}

// TIMER MANAGEMENT
function startTimerCountdown() {
  clearInterval(timerInterval);
  timerBox.classList.remove('untimed-mode');
  satExamState.timerRunning = true;
  updateTimerDisplay(satExamState.timerSeconds);

  timerInterval = setInterval(() => {
    if (!satExamState.timerRunning) return;
    satExamState.timerSeconds--;
    updateTimerDisplay(satExamState.timerSeconds);

    if (satExamState.timerSeconds <= 0) {
      clearInterval(timerInterval);
      satExamState.timerRunning = false;
      if (satExamState.isActive && satExamState.currentModule === 1) {
        showModuleTransition();
      } else {
        alert('Time expired for this module! Directing to Score Report.');
        showResults();
      }
    }
  }, 1000);
}

function initStopwatch() {
  clearInterval(timerInterval);
  timerBox.classList.remove('untimed-mode');
  let elapsed = 0;
  updateTimerDisplay(elapsed);
  timerInterval = setInterval(() => {
    elapsed++;
    updateTimerDisplay(elapsed);
  }, 1000);
}

function updateTimerDisplay(totalSec) {
  if (mode === 'untimed' || satExamState.isUntimed) {
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
    return;
  }
  const m = Math.floor(Math.abs(totalSec) / 60);
  const s = Math.abs(totalSec) % 60;
  timerText.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  if (totalSec <= 300 && satExamState.isActive && !satExamState.isUntimed) {
    timerBox.style.borderColor = 'var(--incorrect)';
    timerText.style.color = 'var(--incorrect)';
  } else {
    timerBox.style.borderColor = '';
    timerText.style.color = '';
  }
}

// MODE SWITCHER (3 MODES)
function setMode(newMode) {
  mode = newMode;
  localStorage.setItem('sat_mode', mode);

  [modePracticeBtn, modeTestBtn, modeUntimedBtn].forEach(b => b && b.classList.remove('active'));
  [hubModePractice, hubModeTest, hubModeUntimed].forEach(b => b && b.classList.remove('active'));

  if (mode === 'practice') {
    if (modePracticeBtn) modePracticeBtn.classList.add('active');
    if (hubModePractice) hubModePractice.classList.add('active');
    if (checkAnswerRow) checkAnswerRow.style.display = 'flex';
    satExamState.isUntimed = false;
    timerBox.classList.remove('untimed-mode');
  } else if (mode === 'untimed') {
    if (modeUntimedBtn) modeUntimedBtn.classList.add('active');
    if (hubModeUntimed) hubModeUntimed.classList.add('active');
    if (checkAnswerRow) checkAnswerRow.style.display = 'none';
    satExamState.isUntimed = true;
    timerText.textContent = '♾️ Untimed';
    timerBox.classList.add('untimed-mode');
  } else {
    if (modeTestBtn) modeTestBtn.classList.add('active');
    if (hubModeTest) hubModeTest.classList.add('active');
    if (checkAnswerRow) checkAnswerRow.style.display = 'none';
    satExamState.isUntimed = false;
    timerBox.classList.remove('untimed-mode');
  }

  if (testArenaView && testArenaView.style.display === 'flex') {
    renderQuestion(currentSubsetIdx);
  }
}

// RENDER QUESTION
function renderQuestion(idx) {
  if (!activeQuestions || activeQuestions.length === 0) return;
  currentSubsetIdx = Math.max(0, Math.min(idx, activeQuestions.length - 1));
  const q = activeQuestions[currentSubsetIdx];
  const qId = q.id;

  const globalIdx = ALL_QUESTIONS.findIndex(item => item.id === qId);
  if (globalIdx !== -1) {
    localStorage.setItem('sat_last_q', globalIdx);
  }

  const displayQNum = q.qnum_in_module || (currentSubsetIdx + 1);
  qNumBox.textContent = displayQNum;
  currentQNum.textContent = displayQNum;
  totalActiveQNum.textContent = activeQuestions.length;
  domainTag.textContent = q.category || q.domain || 'Reading and Writing';
  moduleName.textContent = `Version ${q.variant_num || 1} • Section 1, ${q.module || 'Module 1'}`;

  // Passage
  passageBody.innerHTML = q.p || '';
  if (q.chart) {
    chartImg.src = q.chart;
    chartContainer.style.display = 'block';
  } else {
    chartContainer.style.display = 'none';
  }

  // Restore highlights
  if (highlights[qId] && highlights[qId].length > 0) {
    highlights[qId].forEach(hl => {
      highlightTextInPassage(hl.text, hl.color);
    });
  }

  // Flag
  if (flags[qId]) {
    flagBtn.classList.add('active');
    document.getElementById('flagLabel').textContent = 'Flagged';
  } else {
    flagBtn.classList.remove('active');
    document.getElementById('flagLabel').textContent = 'Mark for Review';
  }

  // Question Stem
  questionStem.textContent = q.q;

  // Options
  optionsList.innerHTML = '';
  const chosen = answers[qId];
  const isChecked = !!checkedQuestions[qId];
  const isEliminated = eliminations[qId] || [];

  q.o.forEach((optText, optIdx) => {
    const card = document.createElement('div');
    card.className = 'opt-card';
    card.dataset.idx = optIdx;

    if (isEliminated.includes(optIdx)) card.classList.add('eliminated');

    if (mode === 'practice') {
      if (isChecked && chosen !== undefined) {
        if (optIdx === q.a) card.classList.add('correct');
        else if (optIdx === chosen) card.classList.add('incorrect');
      } else {
        if (chosen === optIdx) card.classList.add('selected');
      }
    } else {
      if (chosen === optIdx) card.classList.add('selected');
    }

    const letter = String.fromCharCode(65 + optIdx);
    card.innerHTML = `
      <div class="opt-circle">${letter}</div>
      <div class="opt-text">${optText}</div>
      <div class="opt-actions">
        <button class="btn-eliminate" title="Cross out option" onclick="event.stopPropagation(); toggleEliminate(${optIdx})">
          ${isEliminated.includes(optIdx) ? 'Undo' : 'ABC'}
        </button>
      </div>
    `;

    card.addEventListener('click', () => selectAnswer(optIdx));
    optionsList.appendChild(card);
  });

  // Blank filled preview
  const blankEl = passageBody.querySelector('.sat-blank');
  if (blankEl) {
    if (chosen !== undefined && q.o[chosen]) {
      blankEl.textContent = q.o[chosen];
      blankEl.classList.add('filled');
    } else {
      blankEl.textContent = '______';
      blankEl.classList.remove('filled');
    }
  }

  // Practice Mode Check Answer Row
  if (mode === 'practice') {
    checkAnswerRow.style.display = 'flex';
    if (isChecked) {
      checkAnswerBtn.textContent = 'Check Again';
      ansFeedbackTag.style.display = 'inline-block';
      if (chosen === q.a) {
        ansFeedbackTag.className = 'ans-feedback-tag correct';
        ansFeedbackTag.textContent = '✓ Correct';
      } else {
        ansFeedbackTag.className = 'ans-feedback-tag incorrect';
        ansFeedbackTag.textContent = `✗ Incorrect (Correct: ${String.fromCharCode(65 + q.a)})`;
      }
      explanationCard.classList.add('show');
      explanationText.textContent = q.e || `Choice ${String.fromCharCode(65 + q.a)} is the correct answer.`;
    } else {
      checkAnswerBtn.textContent = 'Check Answer';
      ansFeedbackTag.style.display = 'none';
      explanationCard.classList.remove('show');
    }
  } else {
    checkAnswerRow.style.display = 'none';
    explanationCard.classList.remove('show');
  }

  // Prev / Next button states
  prevBtn.disabled = (currentSubsetIdx === 0);
  if (currentSubsetIdx === activeQuestions.length - 1) {
    if (satExamState.isActive && satExamState.currentModule === 1) {
      nextBtn.textContent = 'End Module 1 →';
    } else {
      nextBtn.textContent = 'Finish Test →';
    }
  } else {
    nextBtn.textContent = 'Next →';
  }

  // Scroll both panes to top smoothly
  if (passagePane) passagePane.scrollTop = 0;
  if (questionPane) questionPane.scrollTop = 0;
  if (passageBody) passageBody.scrollTop = 0;
  if (optionsList) optionsList.scrollTop = 0;
}

// SELECT ANSWER
function selectAnswer(optIdx) {
  const q = activeQuestions[currentSubsetIdx];
  const qId = q.id;

  answers[qId] = optIdx;
  localStorage.setItem('sat_answers', JSON.stringify(answers));

  if (checkedQuestions[qId]) {
    delete checkedQuestions[qId];
    localStorage.setItem('sat_checked', JSON.stringify(checkedQuestions));
  }

  renderQuestion(currentSubsetIdx);
  updateHubProgress();
}

// CHECK ANSWER (Practice Mode)
function checkCurrentAnswer() {
  const q = activeQuestions[currentSubsetIdx];
  const qId = q.id;

  if (answers[qId] === undefined) {
    alert('Please select an answer choice before checking.');
    return;
  }

  checkedQuestions[qId] = true;
  localStorage.setItem('sat_checked', JSON.stringify(checkedQuestions));

  renderQuestion(currentSubsetIdx);
}

// ELIMINATE / STRIKETHROUGH
function toggleEliminate(optIdx) {
  const q = activeQuestions[currentSubsetIdx];
  const qId = q.id;

  if (!eliminations[qId]) eliminations[qId] = [];

  const idx = eliminations[qId].indexOf(optIdx);
  if (idx > -1) {
    eliminations[qId].splice(idx, 1);
  } else {
    eliminations[qId].push(optIdx);
    if (answers[qId] === optIdx) {
      delete answers[qId];
      localStorage.setItem('sat_answers', JSON.stringify(answers));
    }
  }

  localStorage.setItem('sat_eliminations', JSON.stringify(eliminations));
  renderQuestion(currentSubsetIdx);
}

// MARK FOR REVIEW FLAG
function toggleFlag() {
  const q = activeQuestions[currentSubsetIdx];
  const qId = q.id;

  flags[qId] = !flags[qId];
  if (!flags[qId]) delete flags[qId];

  localStorage.setItem('sat_flags', JSON.stringify(flags));

  if (flags[qId]) {
    flagBtn.classList.add('active');
    document.getElementById('flagLabel').textContent = 'Flagged';
  } else {
    flagBtn.classList.remove('active');
    document.getElementById('flagLabel').textContent = 'Mark for Review';
  }
}

// HIGHLIGHTER
function setupHighlighter() {
  passageBody.addEventListener('mouseup', handleTextSelection);
}

function handleTextSelection() {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  const hlPopover = document.getElementById('hlPopover');

  if (text.length > 2 && passageBody.contains(sel.anchorNode)) {
    const r = sel.getRangeAt(0).getBoundingClientRect();
    const pRect = passageBody.getBoundingClientRect();

    hlPopover.style.top = `${r.top - pRect.top - 38 + passageBody.scrollTop}px`;
    hlPopover.style.left = `${r.left - pRect.left}px`;
    hlPopover.style.display = 'flex';
  } else {
    hideHlPopover();
  }
}

function hideHlPopover() {
  const pop = document.getElementById('hlPopover');
  if (pop) pop.style.display = 'none';
}

function applyHighlight(color) {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;

  const qId = activeQuestions[currentSubsetIdx].id;
  if (!highlights[qId]) highlights[qId] = [];

  highlights[qId].push({ text, color });
  localStorage.setItem('sat_highlights', JSON.stringify(highlights));

  highlightTextInPassage(text, color);
  hideHlPopover();
  sel.removeAllRanges();
}

function highlightTextInPassage(targetText, color) {
  const inner = passageBody.innerHTML;
  const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  passageBody.innerHTML = inner.replace(re, `<span class="highlight-${color}">$1</span>`);
}

function clearHighlights() {
  const qId = activeQuestions[currentSubsetIdx].id;
  delete highlights[qId];
  localStorage.setItem('sat_highlights', JSON.stringify(highlights));
  renderQuestion(currentSubsetIdx);
}

// QUESTION NAVIGATOR MODAL
function openNavModal(filter = 'all') {
  paletteGrid.innerHTML = '';
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  activeQuestions.forEach((q, idx) => {
    const qId = q.id;
    const isAnswered = answers[qId] !== undefined;
    const isFlagged = !!flags[qId];
    const isChecked = !!checkedQuestions[qId];
    const isCorrect = isAnswered && answers[qId] === q.a;

    if (filter === 'unanswered' && isAnswered) return;
    if (filter === 'flagged' && !isFlagged) return;
    if (filter === 'incorrect' && (!isAnswered || isCorrect)) return;

    const cell = document.createElement('div');
    cell.className = 'palette-cell';
    cell.textContent = q.qnum_in_module || (idx + 1);

    if (idx === currentSubsetIdx) cell.classList.add('current');
    if (isAnswered) cell.classList.add('answered');
    if (mode === 'practice' && isChecked && isAnswered) {
      if (isCorrect) cell.classList.add('correct');
      else cell.classList.add('incorrect');
    }
    if (isFlagged) cell.classList.add('marked');

    cell.addEventListener('click', () => {
      renderQuestion(idx);
      navModalBackdrop.classList.remove('show');
    });

    paletteGrid.appendChild(cell);
  });

  navModalBackdrop.classList.add('show');
}

// AUTHENTIC SCAN MODAL
function toggleScanModal() {
  const modal = document.getElementById('scanModalBackdrop');
  const img = document.getElementById('scanModalImg');
  if (modal.classList.contains('show')) {
    modal.classList.remove('show');
  } else {
    const q = activeQuestions[currentSubsetIdx];
    if (q && q.p_img) {
      img.src = q.p_img;
      modal.classList.add('show');
    }
  }
}

// SHOW OFFICIAL SAT 200-800 SCORE REPORT
function showResults() {
  let pool = activeQuestions;
  if (satExamState.isActive) {
    pool = ALL_QUESTIONS.filter(q => q.variant_num === satExamState.variantNum);
  }

  let totalCorrect = 0;
  let totalAnswered = 0;
  let m1Correct = 0, m1Total = 0;
  let m2Correct = 0, m2Total = 0;
  const domainStats = {};

  pool.forEach(q => {
    const dom = q.domain || 'Reading and Writing';
    if (!domainStats[dom]) domainStats[dom] = { total: 0, correct: 0 };
    domainStats[dom].total++;

    if (q.module === 'Module 1') m1Total++;
    else if (q.module === 'Module 2') m2Total++;

    const chosen = answers[q.id];
    if (chosen !== undefined) {
      totalAnswered++;
      if (chosen === q.a) {
        totalCorrect++;
        domainStats[dom].correct++;
        if (q.module === 'Module 1') m1Correct++;
        else if (q.module === 'Module 2') m2Correct++;
      }
    }
  });

  let scaledScore = 200;
  const poolLen = pool.length;
  if (poolLen === 54) {
    scaledScore = SAT_SCALED_CURVE[Math.min(54, totalCorrect)] || 200;
  } else {
    const normalized = Math.round((totalCorrect / Math.max(1, poolLen)) * 54);
    scaledScore = SAT_SCALED_CURVE[Math.min(54, normalized)] || 200;
  }

  let band = 'Foundational';
  if (scaledScore >= 750) band = '99th Percentile • Advanced';
  else if (scaledScore >= 700) band = '95th Percentile • High Proficiency';
  else if (scaledScore >= 600) band = '75th Percentile • Proficient';
  else if (scaledScore >= 500) band = '50th Percentile • Intermediate';

  document.getElementById('resSatScaledScore').textContent = scaledScore;
  document.getElementById('resPercentileBand').textContent = band;
  document.getElementById('resScoreSub').textContent = `${totalCorrect} / ${poolLen} Correct • ${Math.round((totalCorrect/Math.max(1, poolLen))*100)}% Raw Accuracy`;
  document.getElementById('resCorrectCount').textContent = totalCorrect;
  document.getElementById('resIncorrectCount').textContent = totalAnswered - totalCorrect;
  document.getElementById('resModuleBreakdown').textContent = `M1: ${m1Correct}/${m1Total} | M2: ${m2Correct}/${m2Total}`;

  const barsContainer = document.getElementById('domainBarsContainer');
  barsContainer.innerHTML = '';
  Object.keys(domainStats).forEach(dom => {
    const st = domainStats[dom];
    const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'domain-bar-row';
    row.innerHTML = `
      <div class="domain-bar-header">
        <span>${dom}</span>
        <span>${st.correct} / ${st.total} (${pct}%)</span>
      </div>
      <div class="domain-bar-track">
        <div class="domain-bar-fill" style="width:${pct}%;"></div>
      </div>
    `;
    barsContainer.appendChild(row);
  });

  resultsModalBackdrop.classList.add('show');
}

// EVENTS & SHORTCUTS
function setupEvents() {
  backToHubBtn.addEventListener('click', showHub);
  checkAnswerBtn.addEventListener('click', checkCurrentAnswer);

  prevBtn.addEventListener('click', () => renderQuestion(currentSubsetIdx - 1));
  nextBtn.addEventListener('click', () => {
    if (currentSubsetIdx === activeQuestions.length - 1) {
      if (satExamState.isActive && satExamState.currentModule === 1) {
        showModuleTransition();
      } else {
        showResults();
      }
    } else {
      renderQuestion(currentSubsetIdx + 1);
    }
  });

  const tStartMod2 = document.getElementById('transStartMod2Btn');
  if (tStartMod2) tStartMod2.addEventListener('click', proceedToModule2);

  const tReviewMod1 = document.getElementById('transReviewMod1Btn');
  if (tReviewMod1) tReviewMod1.addEventListener('click', () => {
    if (moduleTransitionModal) moduleTransitionModal.classList.remove('show');
  });

  const openPalBtn = document.getElementById('btnOpenPalette');
  if (openPalBtn) openPalBtn.addEventListener('click', () => openNavModal());

  const closeNavBtn = document.getElementById('closeNavModalBtn');
  if (closeNavBtn) closeNavBtn.addEventListener('click', () => {
    if (navModalBackdrop) navModalBackdrop.classList.remove('show');
  });

  if (navModalBackdrop) {
    navModalBackdrop.addEventListener('click', e => {
      if (e.target === navModalBackdrop) navModalBackdrop.classList.remove('show');
    });
  }

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => openNavModal(btn.dataset.filter));
  });

  const closeResBtn = document.getElementById('closeResultsBtn');
  if (closeResBtn) closeResBtn.addEventListener('click', () => {
    if (resultsModalBackdrop) resultsModalBackdrop.classList.remove('show');
  });

  const restartBtn = document.getElementById('restartPracticeBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetAllProgress();
    });
  }

  const finishTopBtn = document.getElementById('finishTestTopBtn');
  if (finishTopBtn) finishTopBtn.addEventListener('click', showResults);

  const themeBtnEl = document.getElementById('themeBtn');
  if (themeBtnEl) themeBtnEl.addEventListener('click', toggleTheme);

  // Timer Buttons
  if (timerToggleBtn) {
    timerToggleBtn.addEventListener('click', () => {
      satExamState.timerRunning = !satExamState.timerRunning;
      timerToggleBtn.textContent = satExamState.timerRunning ? '⏸' : '▶';
    });
  }
  if (timerHideBtn) {
    timerHideBtn.addEventListener('click', () => {
      timerText.classList.toggle('hidden-timer');
      timerHideBtn.textContent = timerText.classList.contains('hidden-timer') ? 'Show' : 'Hide';
    });
  }

  // Arena Mode Switchers
  if (modePracticeBtn) modePracticeBtn.addEventListener('click', () => setMode('practice'));
  if (modeTestBtn) modeTestBtn.addEventListener('click', () => setMode('test'));
  if (modeUntimedBtn) modeUntimedBtn.addEventListener('click', () => setMode('untimed'));

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (testArenaView.style.display !== 'flex') return;
    if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

    if (e.key === 'ArrowLeft') {
      if (currentSubsetIdx > 0) renderQuestion(currentSubsetIdx - 1);
    } else if (e.key === 'ArrowRight') {
      if (currentSubsetIdx < activeQuestions.length - 1) renderQuestion(currentSubsetIdx + 1);
    } else if (['1', 'a', 'A'].includes(e.key)) {
      selectAnswer(0);
    } else if (['2', 'b', 'B'].includes(e.key)) {
      selectAnswer(1);
    } else if (['3', 'c', 'C'].includes(e.key)) {
      selectAnswer(2);
    } else if (['4', 'd', 'D'].includes(e.key)) {
      selectAnswer(3);
    } else if (e.key === 'Enter' && mode === 'practice') {
      checkCurrentAnswer();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleFlag();
    } else if (e.key === 'u' || e.key === 'U') {
      setMode(mode === 'untimed' ? 'practice' : 'untimed');
    }
  });
}

// EASTER EGGS & MASCOTS
function triggerEasterEgg(type, extra = '') {
  const toast = document.getElementById('easterEggToast');
  if (!toast) return;

  if (type === 'ear-top') toast.textContent = '🦊 Focus Mode Activated! Target: 800';
  else if (type === 'ear-bottom') toast.textContent = '🌟 Miyabi says: Stay sharp, read carefully!';
  else if (type === 'tail' || type === 'cissia') toast.textContent = '🐱 Cissia grants you +50 SAT reading luck!';
  else if (type === 'score') toast.textContent = `🎯 Aiming high: Target ${extra}!`;
  else if (type === 'toast' || type === 'info') toast.textContent = extra;
  else toast.textContent = extra || type;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// 2D CYBER ANIMATED CANVAS BACKGROUND
function init2DHero() {
  const canvas = document.getElementById('heroCanvas2D');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    const color = isDark ? '139, 92, 246' : '217, 119, 6';

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${color}, ${0.12 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}

window.addEventListener('DOMContentLoaded', init);

// AUTHENTIC PDF SCAN VIEWER MODAL
function openScanModal() {
  if (!activeQuestions || !activeQuestions[currentSubsetIdx]) return;
  const q = activeQuestions[currentSubsetIdx];
  const scanBackdrop = document.getElementById('scanModalBackdrop');
  const scanImg = document.getElementById('scanModalImg');
  const scanTitle = document.getElementById('scanModalTitle');
  if (scanBackdrop && scanImg) {
    if (scanTitle) scanTitle.textContent = `Authentic PDF Scan: Test ${q.variant_num || 1} • ${q.module} • Question ${q.q_num}`;
    scanImg.src = `assets/scans/t${q.variant_num || 1}_m${q.module === 'Module 2' ? 2 : 1}_q${q.q_num}.png`;
    scanBackdrop.style.display = 'flex';
  }
}

function closeScanModal() {
  const scanBackdrop = document.getElementById('scanModalBackdrop');
  if (scanBackdrop) scanBackdrop.style.display = 'none';
}
