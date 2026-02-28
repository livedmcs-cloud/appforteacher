async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

const els = {
  lessonText: document.getElementById('lessonText'),
  difficulty: document.getElementById('difficulty'),
  qType: document.getElementById('qType'),
  qCount: document.getElementById('qCount'),
  generateBtn: document.getElementById('generateBtn'),
  generateMsg: document.getElementById('generateMsg'),
  questionList: document.getElementById('questionList'),
  quizTitle: document.getElementById('quizTitle'),
  quizTopic: document.getElementById('quizTopic'),
  quizTime: document.getElementById('quizTime'),
  createQuizBtn: document.getElementById('createQuizBtn'),
  quizList: document.getElementById('quizList'),
  studentName: document.getElementById('studentName'),
  attemptQuizTitle: document.getElementById('attemptQuizTitle'),
  correct: document.getElementById('correct'),
  total: document.getElementById('total'),
  submitAttemptBtn: document.getElementById('submitAttemptBtn'),
  metricsGrid: document.getElementById('metricsGrid')
};

function renderQuestionBank(questions) {
  els.questionList.innerHTML = '';
  questions.forEach(q => {
    const li = document.createElement('li');
    li.textContent = `[${q.difficulty} | ${q.type}] ${q.stem}`;
    els.questionList.appendChild(li);
  });
}

function renderQuizzes(quizzes) {
  els.quizList.innerHTML = '';
  quizzes.forEach(q => {
    const li = document.createElement('li');
    li.textContent = `${q.title} (${q.topic}) • ${q.status} • ${q.timeLimitMinutes} min`;
    els.quizList.appendChild(li);
  });
}

function renderMetrics(metrics) {
  els.metricsGrid.innerHTML = '';
  const rows = [
    ['Total Students', metrics.totalStudents],
    ['Active Quizzes', metrics.activeQuizzes],
    ['Average Score', `${metrics.averageScore}%`],
    ['Highest Score', `${metrics.highestScore}%`],
    ['Lowest Score', `${metrics.lowestScore}%`],
    ['Completion Rate', `${metrics.completionRate}%`]
  ];

  rows.forEach(([label, value]) => {
    const card = document.createElement('div');
    card.className = 'metric';
    card.innerHTML = `<h3>${label}</h3><p>${value}</p>`;
    els.metricsGrid.appendChild(card);
  });
}

async function loadData() {
  const [questionData, quizData, metrics] = await Promise.all([
    api('/api/questions'),
    api('/api/quizzes'),
    api('/api/analytics/overview')
  ]);

  renderQuestionBank(questionData.questions);
  renderQuizzes(quizData.quizzes);
  renderMetrics(metrics);
}

els.generateBtn.addEventListener('click', async () => {
  try {
    const payload = {
      lessonText: els.lessonText.value,
      difficulty: els.difficulty.value,
      type: els.qType.value,
      count: Number(els.qCount.value)
    };
    const data = await api('/api/questions/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    els.generateMsg.textContent = `Generated ${data.questions.length} questions.`;
    await loadData();
  } catch (err) {
    els.generateMsg.textContent = err.message;
  }
});

els.createQuizBtn.addEventListener('click', async () => {
  try {
    const questions = await api('/api/questions');
    await api('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: els.quizTitle.value || 'Untitled Quiz',
        topic: els.quizTopic.value || 'General',
        timeLimitMinutes: Number(els.quizTime.value),
        questionIds: questions.questions.map(q => q.id)
      })
    });
    await loadData();
  } catch (err) {
    alert(err.message);
  }
});

els.submitAttemptBtn.addEventListener('click', async () => {
  try {
    await api('/api/attempts', {
      method: 'POST',
      body: JSON.stringify({
        studentName: els.studentName.value,
        quizTitle: els.attemptQuizTitle.value,
        correct: Number(els.correct.value),
        total: Number(els.total.value)
      })
    });
    await loadData();
  } catch (err) {
    alert(err.message);
  }
});

loadData().catch(err => {
  els.generateMsg.textContent = `Failed to load initial data: ${err.message}`;
});
