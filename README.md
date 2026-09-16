# 🥷 Ninja SAT — Bluebook Practice Suite

A high-fidelity web recreation of the **College Board Digital SAT Bluebook** testing interface for **Reading & Writing**, featuring an interactive 2D landing page, official 32-minute timers, question review grid, strikethrough eliminator, passage annotation tools, and 5 full practice tests (270 questions total).

---

## 🌟 Key Features

### 🏛️ Authentic Bluebook Test-Taking Interface
- **Split-Screen Workspace**: Draggable center divider separating reading passages from question prompts and answer choices.
- **Official 32-Minute Countdown Timers**: Synchronized 32:00 timer per 27-question module with Hide/Show toggle and low-time warning when < 5 minutes remain.
- **Option Eliminator (`S̶`)**: Strikethrough button on every choice (A, B, C, D) to cross out eliminated options and dim text.
- **Mark for Review**: Ribbon bookmark flag that pins questions for later review across navigation bars and grids.
- **Question Navigator Grid**: 1-to-27 interactive popup matrix showing live status:
  - *Current Question* (blue outline indicator)
  - *Answered Question* (solid filled tile)
  - *Unanswered Question* (open tile)
  - *Marked for Review* (red flag badge)
- **Passage Annotation**: Select text in any reading passage to highlight in yellow or underline key evidence.
- **Section Reviews & Transitions**: Official Bluebook review screens at the end of Module 1 (with unanswered question alerts), optional 10-minute break timer, and final test submission.
- **Display Mode Toggle**: Choose between clean interactive DOM typography or exact high-resolution scan references.

### 🎮 Cool 2D Landing Page
- Modern minimalist "Ninja" dark-theme dashboard with test selection cards.
- Flexible Practice Modes:
  - **Full Official Test**: Timed 64-minute simulation (Module 1 → 10-min Break → Module 2).
  - **Module 1 Only**: 27 Questions, 32 minutes.
  - **Module 2 Only**: 27 Questions, 32 minutes.
  - **Untimed Practice**: Self-paced study without countdown pressure.
- **Autosave & Resume**: Active test progress, answers, bookmarks, and remaining time are saved in `localStorage`. 1-click resume anytime!

---

## 📚 Practice Tests Included (Reading & Writing)

All 5 practice tests have been extracted into structured data and visual assets:

1. **Practice Test 1**: 54 Questions (Module 1: 27 Qs, Module 2: 27 Qs)
2. **Practice Test 2**: 54 Questions (Module 1: 27 Qs, Module 2: 27 Qs)
3. **Practice Test 3**: 54 Questions (Module 1: 27 Qs, Module 2: 27 Qs)
4. **Practice Test 4**: 54 Questions (Module 1: 27 Qs, Module 2: 27 Qs)
5. **Practice Test 5**: 54 Questions (Module 1: 27 Qs, Module 2: 27 Qs)

*Total: 270 Reading & Writing questions.*

---

## ⌨️ Bluebook Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `A`, `B`, `C`, `D` or `1`, `2`, `3`, `4` | Select answer choice |
| `←` (Left Arrow) | Previous question |
| `→` (Right Arrow) | Next question |
| `M` | Toggle **Mark for Review** |
| `H` | Toggle **Hide / Show Timer** |
| `G` | Toggle **Question Navigator Grid** |
| `Esc` | Close any open modal / popup |

---

## 🚀 Quick Start (Run Locally)

This suite is built as a zero-dependency static web application:

1. Simply double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.
2. Alternatively, run a lightweight local web server:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`.

---

## 🌐 Deploying to GitHub Pages

To share your practice suite online via GitHub Pages:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. On GitHub, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`!

---

## 📁 Project Structure

```
ninja/
├── index.html                   # Main application & landing page
├── css/
│   └── bluebook.css             # Authentic Bluebook styling & 2D landing page styles
├── js/
│   └── app.js                   # Application state machine & test runner engine
├── data/
│   ├── tests_data.js            # Standalone test data (CORS-friendly for local use)
│   └── practice_tests.json      # Structured JSON test database
├── assets/
│   └── questions/               # 270 high-res question visual snapshots (.webp)
├── scripts/
│   └── extract_tests.py         # PyMuPDF + WinOCR pipeline script
└── README.md                    # Documentation
```
