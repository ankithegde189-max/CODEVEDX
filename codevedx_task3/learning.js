// Learning Hub Quiz Engine & Threat Analysis Controls
const LearningController = {
  currentQuestionIdx: 0,
  score: 0,
  selectedOptionIdx: null,
  hasAnswered: false,

  init() {
    window.LearningController = this;

    // Next Question Button
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNextQuestion());
    }

    // Restart Quiz Button
    const restartBtn = document.getElementById('quiz-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    // Save Score Button
    const saveBtn = document.getElementById('quiz-save-stats-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveScoreToDb());
    }
  },

  render() {
    this.renderQuestion();
  },

  renderQuestion() {
    const questionNum = document.getElementById('quiz-question-number');
    const scoreVal = document.getElementById('quiz-score');
    const questionText = document.getElementById('quiz-question-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (!optionsContainer) return;

    // Ensure we are in active quiz mode display
    document.getElementById('quiz-active-section').style.display = 'block';
    document.getElementById('quiz-results-section').style.display = 'none';

    const currentQuestion = MOCK_QUIZ_QUESTIONS[this.currentQuestionIdx];

    // Header updates
    questionNum.textContent = `Question ${this.currentQuestionIdx + 1} of ${MOCK_QUIZ_QUESTIONS.length}`;
    scoreVal.textContent = `Score: ${this.score}`;
    questionText.textContent = currentQuestion.question;

    // Reset feedback states
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'quiz-feedback';
    nextBtn.style.display = 'none';

    // Populate options
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((optText, idx) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'quiz-option';
      optDiv.innerHTML = `
        <span style="font-weight:bold; width: 20px;">${String.fromCharCode(65 + idx)}.</span>
        <span>${optText}</span>
      `;
      
      if (!this.hasAnswered) {
        optDiv.addEventListener('click', () => this.evaluateAnswer(idx));
      } else {
        // Render states if already clicked
        if (idx === currentQuestion.correctIdx) {
          optDiv.classList.add('correct');
        } else if (idx === this.selectedOptionIdx) {
          optDiv.classList.add('incorrect');
        }
      }
      
      optionsContainer.appendChild(optDiv);
    });
  },

  evaluateAnswer(selectedIdx) {
    if (this.hasAnswered) return;

    this.hasAnswered = true;
    this.selectedOptionIdx = selectedIdx;
    
    const currentQuestion = MOCK_QUIZ_QUESTIONS[this.currentQuestionIdx];
    const isCorrect = (selectedIdx === currentQuestion.correctIdx);

    if (isCorrect) {
      this.score++;
    }

    // Refresh display to lock and color options
    this.renderQuestion();

    // Show Feedback Box
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    feedbackBox.style.display = 'block';
    if (isCorrect) {
      feedbackBox.classList.add('success');
      feedbackBox.innerHTML = `<b>Correct!</b><br>${currentQuestion.explanation}`;
    } else {
      feedbackBox.classList.add('danger');
      feedbackBox.innerHTML = `<b>Incorrect.</b> The correct answer was <b>${String.fromCharCode(65 + currentQuestion.correctIdx)}</b>.<br>${currentQuestion.explanation}`;
    }

    nextBtn.style.display = 'inline-block';
  },

  handleNextQuestion() {
    this.currentQuestionIdx++;
    this.hasAnswered = false;
    this.selectedOptionIdx = null;

    if (this.currentQuestionIdx < MOCK_QUIZ_QUESTIONS.length) {
      this.renderQuestion();
    } else {
      this.showResults();
    }
  },

  showResults() {
    document.getElementById('quiz-active-section').style.display = 'none';
    document.getElementById('quiz-results-section').style.display = 'block';

    const percentage = Math.round((this.score / MOCK_QUIZ_QUESTIONS.length) * 100);
    document.getElementById('quiz-results-summary').innerHTML = `
      You successfully answered <b>${this.score}</b> out of <b>${MOCK_QUIZ_QUESTIONS.length}</b> questions.<br>
      Total Awareness Compliance Level: <b>${percentage}%</b>
    `;
  },

  restartQuiz() {
    this.currentQuestionIdx = 0;
    this.score = 0;
    this.selectedOptionIdx = null;
    this.hasAnswered = false;
    this.renderQuestion();
  },

  async saveScoreToDb() {
    if (!AppState.activeUser) {
      alert("No active employee user selected to save compliance metrics.");
      return;
    }

    const percentage = Math.round((this.score / MOCK_QUIZ_QUESTIONS.length) * 100);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: AppState.activeUser.name,
          score: percentage,
          total: 100
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Compliance score of ${percentage}% successfully logged for "${AppState.activeUser.name}".`);
        
        // Go back to Dashboard
        const dashboardNav = document.querySelector('.nav-item[data-target="view-dashboard"]');
        if (dashboardNav) dashboardNav.click();
        
        AppState.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit score to database.");
    }
  }
};

// Bind load
document.addEventListener('DOMContentLoaded', () => LearningController.init());
