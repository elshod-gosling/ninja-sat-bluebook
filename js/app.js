(function () {
  'use strict';

  let state = {
    testData: null,
    activeSession: null,
    timerInterval: null,
    breakInterval: null,
    lineReaderActive: false,
    zoomScale: 1.0,
    isDraggingDivider: false
  };

  const STORAGE_KEY = 'ninja_sat_active_session';
  const HISTORY_KEY = 'ninja_sat_test_history';

  const el = {
    // Views
    hubView: document.getElementById('hubView'),
    testView: document.getElementById('testView'),
    reviewView: document.getElementById('reviewView'),
    breakView: document.getElementById('breakView'),
    resultsView: document.getElementById('resultsView'),

    // Hub
    testsGrid: document.getElementById('testsGrid'),
    resumeBanner: document.getElementById('resumeBanner'),
    resumeTitle: document.getElementById('resumeTitle'),
    resumeSubtitle: document.getElementById('resumeSubtitle'),
    resumeBtn: document.getElementById('resumeBtn'),
    discardBtn: document.getElementById('discardBtn'),
    hubShortcutsBtn: document.getElementById('hubShortcutsBtn'),
    hubGuideBtn: document.getElementById('hubGuideBtn'),

    // Test Shell
    bbSectionTitle: document.getElementById('bbSectionTitle'),
    bbDirectionsBtn: document.getElementById('bbDirectionsBtn'),
    bbTimerDisplay: document.getElementById('bbTimerDisplay'),
    bbTimerToggleBtn: document.getElementById('bbTimerToggleBtn'),
    bbUntimedToggleBtn: document.getElementById('bbUntimedToggleBtn'),
    bbAnnotateBtn: document.getElementById('bbAnnotateBtn'),
    bbMoreBtn: document.getElementById('bbMoreBtn'),
    bbMainArea: document.getElementById('bbMainArea'),
    bbLeftPane: document.getElementById('bbLeftPane'),
    bbPassageImg: document.getElementById('bbPassageImg'),
    bbPaneDivider: document.getElementById('bbPaneDivider'),
    bbRightPane: document.getElementById('bbRightPane'),
    bbQBadge: document.getElementById('bbQBadge'),
    bbMarkReviewBtn: document.getElementById('bbMarkReviewBtn'),
    bbMarkText: document.getElementById('bbMarkText'),
    bbQuestionImg: document.getElementById('bbQuestionImg'),
    bbLineReader: document.getElementById('bbLineReader'),
    bbEndModuleBtn: document.getElementById('bbEndModuleBtn'),
    bbNavGridBtn: document.getElementById('bbNavGridBtn'),
    bbNavGridLabel: document.getElementById('bbNavGridLabel'),
    bbBtnBack: document.getElementById('bbBtnBack'),
    bbBtnNext: document.getElementById('bbBtnNext'),

    // Grid Modal
    gridModalOverlay: document.getElementById('gridModalOverlay'),
    gridModalTitle: document.getElementById('gridModalTitle'),
    gridModalCloseBtn: document.getElementById('gridModalCloseBtn'),
    gridModalItems: document.getElementById('gridModalItems'),

    // Review View
    reviewSectionTitle: document.getElementById('reviewSectionTitle'),
    reviewTimerDisplay: document.getElementById('reviewTimerDisplay'),
    reviewHeading: document.getElementById('reviewHeading'),
    reviewAlertBox: document.getElementById('reviewAlertBox'),
    reviewAlertText: document.getElementById('reviewAlertText'),
    reviewGrid: document.getElementById('reviewGrid'),
    reviewBackBtn: document.getElementById('reviewBackBtn'),
    reviewProceedBtn: document.getElementById('reviewProceedBtn'),

    // Break View
    breakTimerDisplay: document.getElementById('breakTimerDisplay'),
    resumeBreakBtn: document.getElementById('resumeBreakBtn'),

    // Results View
    resultsTitle: document.getElementById('resultsTitle'),
    resStatAnswered: document.getElementById('resStatAnswered'),
    resStatUnanswered: document.getElementById('resStatUnanswered'),
    resStatMarked: document.getElementById('resStatMarked'),
    resStatTime: document.getElementById('resStatTime'),
    resultsQuestionList: document.getElementById('resultsQuestionList'),
    resultsHubBtn: document.getElementById('resultsHubBtn'),
    resultsReviewBtn: document.getElementById('resultsReviewBtn'),

    // Modals
    directionsModal: document.getElementById('directionsModal'),
    directionsCloseBtn: document.getElementById('directionsCloseBtn'),
    moreModal: document.getElementById('moreModal'),
    moreCloseBtn: document.getElementById('moreCloseBtn'),
    toggleLineReaderBtn: document.getElementById('toggleLineReaderBtn'),
    fontDecBtn: document.getElementById('fontDecBtn'),
    fontIncBtn: document.getElementById('fontIncBtn'),
    exitToHubBtn: document.getElementById('exitToHubBtn'),
    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    confirmCloseBtn: document.getElementById('confirmCloseBtn'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmProceedBtn: document.getElementById('confirmProceedBtn')
  };

  function init() {
    if (window.NINJA_TESTS) {
      state.testData = window.NINJA_TESTS;
    }
    renderLandingPage();
    checkSavedSession();
    bindEvents();
  }

  function showView(viewId) {
    const views = ['hubView', 'testView', 'reviewView', 'breakView', 'resultsView'];
    views.forEach(id => {
      if (el[id]) {
        el[id].style.display = (id === viewId) ? 'flex' : 'none';
      }
    });
    if (viewId !== 'testView') {
      closeAllModals();
    }
  }

  function renderLandingPage() {
    if (!state.testData) return;
    el.testsGrid.innerHTML = '';
    const testKeys = Object.keys(state.testData).sort();

    testKeys.forEach((key, index) => {
      const test = state.testData[key];
      const testNum = test.test_number || (index + 1);

      const card = document.createElement('div');
      card.className = 'test-card';
      card.innerHTML = `
        <div class="test-card-header">
          <div class="test-card-num">Practice Test ${testNum}</div>
          <span class="test-pill">Official 54 Qs</span>
        </div>
        <p class="test-card-desc">
          Complete College Board-style Reading & Writing practice test with Modules 1 and 2. 
          Includes authentic passages, vocabulary in context, grammar conventions, and synthesis.
        </p>
        <div class="module-pills-row">
          <div class="module-pill-badge">
            <span class="mod-title">Module 1</span>
            <span class="mod-meta">27 Qs • 32 Min</span>
          </div>
          <div class="module-pill-badge">
            <span class="mod-title">Module 2</span>
            <span class="mod-meta">27 Qs • 32 Min</span>
          </div>
        </div>
        <div class="test-actions">
          <button class="btn-start-full" data-test="${key}" data-mode="full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Start Timed Test (32m)
          </button>
          <button class="btn-start-untimed" data-test="${key}" data-mode="untimed">
            <span>♾️</span> Start Untimed Practice
          </button>
          <div class="test-sub-actions">
            <button class="btn-sub-opt" data-test="${key}" data-mode="m1">Mod 1 (Timed)</button>
            <button class="btn-sub-opt" data-test="${key}" data-mode="m2">Mod 2 (Timed)</button>
          </div>
        </div>
      `;

      card.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tKey = btn.getAttribute('data-test');
          const mode = btn.getAttribute('data-mode');
          startTestSession(tKey, mode);
        });
      });

      el.testsGrid.appendChild(card);
    });
  }

  function checkSavedSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.testId && state.testData && state.testData[session.testId]) {
          const test = state.testData[session.testId];
          el.resumeBanner.style.display = 'flex';
          el.resumeTitle.textContent = `Resume In-Progress: ${test.title}`;
          const qNum = session.currentQIndex + 1;
          const modeLbl = session.isUntimed ? 'Untimed Practice' : 'Timed Test';
          el.resumeSubtitle.textContent = `Module ${session.currentModule} • Question ${qNum} of 27 • ${modeLbl}`;
          return;
        }
      }
    } catch (e) {
      console.error('Error reading saved session', e);
    }
    el.resumeBanner.style.display = 'none';
  }

  function saveActiveSession() {
    if (!state.activeSession) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.activeSession));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }

  function clearActiveSession() {
    localStorage.removeItem(STORAGE_KEY);
    el.resumeBanner.style.display = 'none';
  }
  function startTestSession(testId, mode) {
    const test = state.testData[testId];
    if (!test) return;

    const startModule = (mode === 'm2') ? 2 : 1;
    const isUntimed = (mode === 'untimed');

    state.activeSession = {
      testId: testId,
      mode: mode,
      currentModule: startModule,
      currentQIndex: 0,
      answers: {},
      marked: [],
      eliminated: {},
      m1TimeRemaining: 32 * 60,
      m2TimeRemaining: 32 * 60,
      timerHidden: false,
      isUntimed: isUntimed,
      startedAt: Date.now()
    };

    saveActiveSession();
    startTestingShell();
  }

  function resumeSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.activeSession = JSON.parse(raw);
        startTestingShell();
      }
    } catch (e) {
      console.error('Failed to resume session', e);
    }
  }

  function startTestingShell() {
    showView('testView');
    syncUntimedUi();
    startTimer();
    loadQuestion(state.activeSession.currentQIndex);
  }

  function syncUntimedUi() {
    if (!state.activeSession) return;
    if (state.activeSession.isUntimed) {
      el.bbUntimedToggleBtn.classList.add('active');
      el.bbUntimedToggleBtn.textContent = '⏱️ Enable Timer';
      el.bbTimerDisplay.textContent = '♾️ Untimed';
      el.bbTimerToggleBtn.style.display = 'none';
    } else {
      el.bbUntimedToggleBtn.classList.remove('active');
      el.bbUntimedToggleBtn.textContent = '♾️ Untimed';
      el.bbTimerToggleBtn.style.display = 'inline-block';
    }
  }

  function toggleUntimedMode() {
    if (!state.activeSession) return;
    state.activeSession.isUntimed = !state.activeSession.isUntimed;
    syncUntimedUi();
    if (state.activeSession.isUntimed) {
      clearInterval(state.timerInterval);
    } else {
      startTimer();
    }
    saveActiveSession();
  }

  function startTimer() {
    clearInterval(state.timerInterval);

    if (state.activeSession.isUntimed) {
      syncUntimedUi();
      return;
    }

    syncUntimedUi();
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      if (!state.activeSession || state.activeSession.isUntimed) return;

      const modKey = (state.activeSession.currentModule === 1) ? 'm1TimeRemaining' : 'm2TimeRemaining';
      if (state.activeSession[modKey] > 0) {
        state.activeSession[modKey]--;
        updateTimerDisplay();
        if (state.activeSession[modKey] % 10 === 0) {
          saveActiveSession();
        }
      } else {
        clearInterval(state.timerInterval);
        handleTimeExpired();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!state.activeSession) return;
    if (state.activeSession.isUntimed) {
      el.bbTimerDisplay.textContent = '♾️ Untimed';
      return;
    }

    const timeSec = (state.activeSession.currentModule === 1)
      ? state.activeSession.m1TimeRemaining
      : state.activeSession.m2TimeRemaining;

    const mins = Math.floor(timeSec / 60);
    const secs = timeSec % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (state.activeSession.timerHidden && timeSec > 300) {
      el.bbTimerDisplay.textContent = '••:••';
      el.bbTimerToggleBtn.textContent = 'Show';
    } else {
      el.bbTimerDisplay.textContent = formatted;
      el.bbTimerToggleBtn.textContent = 'Hide';
    }

    if (el.reviewTimerDisplay) {
      el.reviewTimerDisplay.textContent = state.activeSession.isUntimed ? '♾️ Untimed' : formatted;
    }

    if (timeSec <= 300) {
      el.bbTimerDisplay.classList.add('low-time');
      state.activeSession.timerHidden = false;
    } else {
      el.bbTimerDisplay.classList.remove('low-time');
    }
  }

  function toggleTimerVisibility() {
    if (!state.activeSession || state.activeSession.isUntimed) return;
    const timeSec = (state.activeSession.currentModule === 1)
      ? state.activeSession.m1TimeRemaining
      : state.activeSession.m2TimeRemaining;

    if (timeSec <= 300) {
      alert('The timer cannot be hidden with less than 5 minutes remaining.');
      return;
    }

    state.activeSession.timerHidden = !state.activeSession.timerHidden;
    updateTimerDisplay();
  }

  function handleTimeExpired() {
    alert(`Time is up for Section 1, Module ${state.activeSession.currentModule}!`);
    openReviewView();
  }

  function getActiveModuleQuestions() {
    if (!state.activeSession || !state.testData) return [];
    const test = state.testData[state.activeSession.testId];
    if (!test) return [];
    const modKey = (state.activeSession.currentModule === 1) ? 'module_1' : 'module_2';
    return test.modules[modKey]?.questions || [];
  }

  function loadQuestion(index) {
    const questions = getActiveModuleQuestions();
    if (!questions || index < 0 || index >= questions.length) return;

    state.activeSession.currentQIndex = index;
    const q = questions[index];
    const qNum = index + 1;

    el.bbSectionTitle.textContent = `Section 1, Module ${state.activeSession.currentModule}: Reading and Writing`;
    el.bbQBadge.textContent = qNum;
    el.bbNavGridLabel.textContent = `Question ${qNum} of 27`;

    const isMarked = state.activeSession.marked.includes(q.id);
    if (isMarked) {
      el.bbMarkReviewBtn.classList.add('marked');
      el.bbMarkText.textContent = 'Marked for Review';
    } else {
      el.bbMarkReviewBtn.classList.remove('marked');
      el.bbMarkText.textContent = 'Mark for Review';
    }

    el.bbBtnBack.disabled = (index === 0);
    el.bbBtnNext.textContent = (index === 26) ? 'Next' : 'Next';

    // Load High-Resolution Clean Visual Assets (Zero OCR bugs!)
    if (q.passage_image) {
      el.bbPassageImg.src = q.passage_image;
    }
    if (q.question_image) {
      el.bbQuestionImg.src = q.question_image;
    }

    // Render Choice Buttons
    renderChoices(q);

    el.bbLeftPane.scrollTop = 0;
    el.bbRightPane.scrollTop = 0;

    saveActiveSession();
  }

  function renderChoices(q) {
    const options = ['A', 'B', 'C', 'D'];
    const selectedAnswer = state.activeSession.answers[q.id] || null;
    const eliminatedList = state.activeSession.eliminated[q.id] || [];

    options.forEach(opt => {
      const wrapper = document.querySelector(`.choice-btn-wrapper[data-opt="${opt}"]`);
      if (!wrapper) return;

      const btn = wrapper.querySelector('.bb-choice-btn');
      if (selectedAnswer === opt) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }

      if (eliminatedList.includes(opt)) {
        wrapper.classList.add('struck-through');
      } else {
        wrapper.classList.remove('struck-through');
      }
    });
  }

  function selectChoice(qId, choice) {
    if (!state.activeSession) return;

    state.activeSession.answers[qId] = choice;

    if (state.activeSession.eliminated[qId]) {
      state.activeSession.eliminated[qId] = state.activeSession.eliminated[qId].filter(c => c !== choice);
    }

    const currentQ = getActiveModuleQuestions()[state.activeSession.currentQIndex];
    if (currentQ && currentQ.id === qId) {
      renderChoices(currentQ);
    }

    saveActiveSession();
  }

  function toggleEliminateChoice(qId, choice) {
    if (!state.activeSession) return;
    if (!state.activeSession.eliminated[qId]) {
      state.activeSession.eliminated[qId] = [];
    }

    const list = state.activeSession.eliminated[qId];
    const idx = list.indexOf(choice);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(choice);
      if (state.activeSession.answers[qId] === choice) {
        delete state.activeSession.answers[qId];
      }
    }

    const currentQ = getActiveModuleQuestions()[state.activeSession.currentQIndex];
    if (currentQ && currentQ.id === qId) {
      renderChoices(currentQ);
    }

    saveActiveSession();
  }

  function toggleMarkForReview() {
    if (!state.activeSession) return;
    const questions = getActiveModuleQuestions();
    const q = questions[state.activeSession.currentQIndex];
    if (!q) return;

    const idx = state.activeSession.marked.indexOf(q.id);
    if (idx >= 0) {
      state.activeSession.marked.splice(idx, 1);
      el.bbMarkReviewBtn.classList.remove('marked');
      el.bbMarkText.textContent = 'Mark for Review';
    } else {
      state.activeSession.marked.push(q.id);
      el.bbMarkReviewBtn.classList.add('marked');
      el.bbMarkText.textContent = 'Marked for Review';
    }

    saveActiveSession();
  }
  function toggleNavGridModal() {
    const isActive = el.gridModalOverlay.classList.contains('active');
    if (isActive) {
      el.gridModalOverlay.classList.remove('active');
    } else {
      renderNavGrid();
      el.gridModalOverlay.classList.add('active');
    }
  }

  function renderNavGrid() {
    const questions = getActiveModuleQuestions();
    el.gridModalItems.innerHTML = '';
    el.gridModalTitle.textContent = `Section 1, Module ${state.activeSession.currentModule}: Reading and Writing`;

    questions.forEach((q, idx) => {
      const tile = document.createElement('div');
      tile.className = 'bb-grid-tile';
      tile.textContent = (idx + 1);

      if (idx === state.activeSession.currentQIndex) {
        tile.classList.add('current');
      }
      if (state.activeSession.answers[q.id]) {
        tile.classList.add('answered');
      }
      if (state.activeSession.marked.includes(q.id)) {
        tile.classList.add('marked');
      }

      tile.addEventListener('click', () => {
        el.gridModalOverlay.classList.remove('active');
        loadQuestion(idx);
      });

      el.gridModalItems.appendChild(tile);
    });
  }

  function openReviewView() {
    showView('reviewView');
    const modNum = state.activeSession.currentModule;
    el.reviewSectionTitle.textContent = `Section 1, Module ${modNum}: Review`;
    el.reviewHeading.textContent = `Section 1, Module ${modNum}: Review`;

    const questions = getActiveModuleQuestions();
    let unansweredCount = 0;

    el.reviewGrid.innerHTML = '';
    questions.forEach((q, idx) => {
      const tile = document.createElement('div');
      tile.className = 'bb-grid-tile';
      tile.style.height = '48px';
      tile.style.fontSize = '15px';
      tile.textContent = (idx + 1);

      if (state.activeSession.answers[q.id]) {
        tile.classList.add('answered');
      } else {
        unansweredCount++;
      }
      if (state.activeSession.marked.includes(q.id)) {
        tile.classList.add('marked');
      }

      tile.addEventListener('click', () => {
        showView('testView');
        loadQuestion(idx);
      });

      el.reviewGrid.appendChild(tile);
    });

    if (unansweredCount > 0) {
      el.reviewAlertBox.style.display = 'flex';
      el.reviewAlertText.textContent = `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.`;
    } else {
      el.reviewAlertBox.style.display = 'none';
    }

    el.reviewProceedBtn.textContent = (modNum === 1 && state.activeSession.mode !== 'm1')
      ? 'Next Section (Start Break)'
      : 'Submit Test';
  }

  function handleReviewProceed() {
    const modNum = state.activeSession.currentModule;

    if (modNum === 1 && state.activeSession.mode !== 'm1') {
      showConfirmModal(
        'Finish Module 1?',
        'Are you sure you want to end Module 1? Once you proceed, you will not be able to return to review or change any answers in Module 1.',
        () => {
          closeAllModals();
          startBreakScreen();
        }
      );
    } else {
      showConfirmModal(
        'Submit Your Test?',
        'Are you sure you want to submit your test? Your responses will be saved and a complete performance review will be generated.',
        () => {
          closeAllModals();
          finishTestAndShowResults();
        }
      );
    }
  }

  function startBreakScreen() {
    clearInterval(state.timerInterval);
    showView('breakView');

    let breakTime = 10 * 60;
    updateBreakDisplay(breakTime);

    clearInterval(state.breakInterval);
    state.breakInterval = setInterval(() => {
      breakTime--;
      if (breakTime >= 0) {
        updateBreakDisplay(breakTime);
      } else {
        clearInterval(state.breakInterval);
        startModule2();
      }
    }, 1000);
  }

  function updateBreakDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.breakTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startModule2() {
    clearInterval(state.breakInterval);
    state.activeSession.currentModule = 2;
    state.activeSession.currentQIndex = 0;
    saveActiveSession();
    startTestingShell();
  }

  function finishTestAndShowResults() {
    clearInterval(state.timerInterval);
    clearInterval(state.breakInterval);

    const session = state.activeSession;
    const test = state.testData[session.testId];

    let allQuestions = [];
    if (session.mode === 'm1') {
      allQuestions = test.modules.module_1.questions;
    } else if (session.mode === 'm2') {
      allQuestions = test.modules.module_2.questions;
    } else {
      allQuestions = [...test.modules.module_1.questions, ...test.modules.module_2.questions];
    }

    let answered = 0;
    let markedCount = session.marked.length;

    allQuestions.forEach(q => {
      if (session.answers[q.id]) answered++;
    });

    const unanswered = allQuestions.length - answered;
    const elapsedSecs = Math.floor((Date.now() - session.startedAt) / 1000);
    const elM = Math.floor(elapsedSecs / 60);
    const elS = elapsedSecs % 60;

    el.resultsTitle.textContent = `${test.title} Completed!`;
    el.resStatAnswered.textContent = answered;
    el.resStatUnanswered.textContent = unanswered;
    el.resStatMarked.textContent = markedCount;
    el.resStatTime.textContent = session.isUntimed ? 'Untimed Practice' : `${elM}m ${elS}s`;

    el.resultsQuestionList.innerHTML = '';
    allQuestions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.padding = '10px 14px';
      item.style.borderRadius = '8px';
      item.style.background = '#f8fafc';
      item.style.border = '1px solid #e2e8f0';

      const userChoice = session.answers[q.id];
      const isMarked = session.marked.includes(q.id);

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 800; font-size: 13px; width: 36px;">Q${idx + 1}</span>
          <span style="font-size: 13px; color: #475569;">Question ${idx + 1} (${q.module_number === 1 ? 'Module 1' : 'Module 2'})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${isMarked ? '<span style="color: #dc2626; font-size: 12px; font-weight: 700;">🚩 Review</span>' : ''}
          <span style="font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 4px; ${userChoice ? 'background: #e8f2fc; color: #0b66c3;' : 'background: #fef2f2; color: #dc2626;'}">
            ${userChoice ? 'Selected: ' + userChoice : 'Omitted'}
          </span>
        </div>
      `;

      el.resultsQuestionList.appendChild(item);
    });

    clearActiveSession();
    showView('resultsView');
  }

  function initResizableDivider() {
    el.bbPaneDivider.addEventListener('mousedown', (e) => {
      state.isDraggingDivider = true;
      el.bbPaneDivider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDraggingDivider) return;
      const totalWidth = el.bbMainArea.clientWidth;
      const leftOffset = el.bbMainArea.getBoundingClientRect().left;
      const currentX = e.clientX - leftOffset;
      const percentage = (currentX / totalWidth) * 100;

      if (percentage >= 25 && percentage <= 75) {
        el.bbLeftPane.style.width = `${percentage}%`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (state.isDraggingDivider) {
        state.isDraggingDivider = false;
        el.bbPaneDivider.classList.remove('dragging');
        document.body.style.cursor = 'default';
      }
    });
  }

  function initLineReader() {
    el.toggleLineReaderBtn.addEventListener('click', () => {
      state.lineReaderActive = !state.lineReaderActive;
      el.bbLineReader.style.display = state.lineReaderActive ? 'block' : 'none';
      el.toggleLineReaderBtn.textContent = state.lineReaderActive ? 'Disable' : 'Enable';
      el.toggleLineReaderBtn.style.background = state.lineReaderActive ? '#e0f2fe' : '#f8fafc';
    });

    el.bbLeftPane.addEventListener('mousemove', (e) => {
      if (!state.lineReaderActive) return;
      const rect = el.bbLeftPane.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      el.bbLineReader.style.top = `${relativeY - 24}px`;
    });
  }

  let onConfirmCallback = null;

  function showConfirmModal(title, msg, onConfirm) {
    el.confirmModalTitle.textContent = title;
    el.confirmModalMessage.textContent = msg;
    onConfirmCallback = onConfirm;
    el.confirmModal.style.display = 'flex';
  }

  function closeAllModals() {
    el.directionsModal.style.display = 'none';
    el.moreModal.style.display = 'none';
    el.confirmModal.style.display = 'none';
    el.gridModalOverlay.classList.remove('active');
  }

  function bindEvents() {
    el.resumeBtn.addEventListener('click', resumeSession);
    el.discardBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to discard your saved test session?')) {
        clearActiveSession();
      }
    });

    el.bbTimerToggleBtn.addEventListener('click', toggleTimerVisibility);
    el.bbUntimedToggleBtn.addEventListener('click', toggleUntimedMode);

    el.bbDirectionsBtn.addEventListener('click', () => {
      el.directionsModal.style.display = 'flex';
    });
    el.directionsCloseBtn.addEventListener('click', () => {
      el.directionsModal.style.display = 'none';
    });
    el.bbMoreBtn.addEventListener('click', () => {
      el.moreModal.style.display = 'flex';
    });
    el.moreCloseBtn.addEventListener('click', () => {
      el.moreModal.style.display = 'none';
    });

    el.bbAnnotateBtn.addEventListener('click', () => {
      alert('Annotate Mode: You can highlight and take notes directly while reading.');
    });

    el.bbMarkReviewBtn.addEventListener('click', toggleMarkForReview);

    // Bind Choice buttons (A, B, C, D)
    ['A', 'B', 'C', 'D'].forEach(opt => {
      const btn = document.querySelector(`.bb-choice-btn[data-opt="${opt}"]`);
      if (btn) {
        btn.addEventListener('click', () => {
          const q = getActiveModuleQuestions()[state.activeSession.currentQIndex];
          if (q) selectChoice(q.id, opt);
        });
      }

      const strikeBtn = document.querySelector(`.bb-strike-toggle[data-strike="${opt}"]`);
      if (strikeBtn) {
        strikeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const q = getActiveModuleQuestions()[state.activeSession.currentQIndex];
          if (q) toggleEliminateChoice(q.id, opt);
        });
      }
    });

    el.bbBtnBack.addEventListener('click', () => {
      if (state.activeSession && state.activeSession.currentQIndex > 0) {
        loadQuestion(state.activeSession.currentQIndex - 1);
      }
    });

    el.bbBtnNext.addEventListener('click', () => {
      if (!state.activeSession) return;
      if (state.activeSession.currentQIndex < 26) {
        loadQuestion(state.activeSession.currentQIndex + 1);
      } else {
        openReviewView();
      }
    });

    el.bbNavGridBtn.addEventListener('click', toggleNavGridModal);
    el.gridModalCloseBtn.addEventListener('click', () => {
      el.gridModalOverlay.classList.remove('active');
    });

    el.bbEndModuleBtn.addEventListener('click', openReviewView);

    el.reviewBackBtn.addEventListener('click', () => {
      showView('testView');
      loadQuestion(state.activeSession.currentQIndex);
    });
    el.reviewProceedBtn.addEventListener('click', handleReviewProceed);

    el.resumeBreakBtn.addEventListener('click', startModule2);

    el.resultsHubBtn.addEventListener('click', () => {
      showView('hubView');
      checkSavedSession();
    });
    el.resultsReviewBtn.addEventListener('click', () => {
      showView('testView');
      loadQuestion(0);
    });

    el.fontIncBtn.addEventListener('click', () => {
      state.zoomScale = Math.min(1.4, state.zoomScale + 0.1);
      el.bbPassageImg.style.transform = `scale(${state.zoomScale})`;
      el.bbPassageImg.style.transformOrigin = 'top left';
    });

    el.fontDecBtn.addEventListener('click', () => {
      state.zoomScale = Math.max(0.8, state.zoomScale - 0.1);
      el.bbPassageImg.style.transform = `scale(${state.zoomScale})`;
      el.bbPassageImg.style.transformOrigin = 'top left';
    });

    el.exitToHubBtn.addEventListener('click', () => {
      closeAllModals();
      showView('hubView');
      checkSavedSession();
    });

    el.confirmCancelBtn.addEventListener('click', closeAllModals);
    el.confirmCloseBtn.addEventListener('click', closeAllModals);
    el.confirmProceedBtn.addEventListener('click', () => {
      if (onConfirmCallback) {
        onConfirmCallback();
        onConfirmCallback = null;
      }
    });

    el.hubShortcutsBtn.addEventListener('click', () => {
      el.moreModal.style.display = 'flex';
    });
    el.hubGuideBtn.addEventListener('click', () => {
      el.directionsModal.style.display = 'flex';
    });

    window.addEventListener('keydown', handleKeyboardShortcuts);

    initResizableDivider();
    initLineReader();
  }

  function handleKeyboardShortcuts(e) {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (el.testView.style.display !== 'flex') return;

    const key = e.key.toUpperCase();

    if (['A', 'B', 'C', 'D'].includes(key)) {
      const q = getActiveModuleQuestions()[state.activeSession.currentQIndex];
      if (q) selectChoice(q.id, key);
    }

    if (['1', '2', '3', '4'].includes(key)) {
      const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      const q = getActiveModuleQuestions()[state.activeSession.currentQIndex];
      if (q) selectChoice(q.id, map[key]);
    }

    if (e.key === 'ArrowLeft') {
      if (state.activeSession.currentQIndex > 0) {
        loadQuestion(state.activeSession.currentQIndex - 1);
      }
    }

    if (e.key === 'ArrowRight') {
      if (state.activeSession.currentQIndex < 26) {
        loadQuestion(state.activeSession.currentQIndex + 1);
      } else {
        openReviewView();
      }
    }

    if (key === 'M') toggleMarkForReview();
    if (key === 'H') toggleTimerVisibility();
    if (key === 'U') toggleUntimedMode();
    if (key === 'G') toggleNavGridModal();
    if (e.key === 'Escape') closeAllModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
