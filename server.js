const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

let questionBank = [];
let quizzes = [];
let students = [
  { id: 1, name: 'Aisha Khan', email: 'aisha@example.com', className: 'Grade 8-A' },
  { id: 2, name: 'Rahul Mehta', email: 'rahul@example.com', className: 'Grade 8-A' }
];
let attempts = [];

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
  });
}

function generateQuestionsFromText({ lessonText = '', type = 'Mixed', difficulty = 'Medium', count = 5 }) {
  const words = lessonText
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))].slice(0, Math.max(count, 5));
  const defaultWords = ['because', 'quickly', 'improve', 'between', 'grammar', 'lesson'];
  const source = uniqueWords.length ? uniqueWords : defaultWords;

  const questions = [];
  for (let i = 0; i < count; i += 1) {
    const keyword = source[i % source.length];
    const id = Date.now() + i;
    questions.push({
      id,
      type,
      difficulty,
      topic: 'Generated',
      stem: `Choose the best meaning of "${keyword}" in context.`,
      options: [
        `Related to ${keyword}`,
        `Opposite of ${keyword}`,
        `A number value`,
        `A punctuation mark`
      ],
      answerIndex: 0,
      explanation: `"${keyword}" is used as a content word in this lesson context.`
    });
  }
  return questions;
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden path' });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8'
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      if (req.method === 'GET' && pathname === '/api/health') {
        return sendJson(res, 200, { status: 'ok', message: 'Smart English Quiz App MVP is running' });
      }

      if (req.method === 'POST' && pathname === '/api/questions/generate') {
        const body = await parseBody(req);
        const count = Number(body.count || 5);
        const questions = generateQuestionsFromText({
          lessonText: body.lessonText || '',
          type: body.type || 'Mixed',
          difficulty: body.difficulty || 'Medium',
          count: Math.min(Math.max(count, 1), 20)
        });
        questionBank = [...questions, ...questionBank];
        return sendJson(res, 200, { questions, bankSize: questionBank.length });
      }

      if (req.method === 'GET' && pathname === '/api/questions') {
        return sendJson(res, 200, { questions: questionBank });
      }

      if (req.method === 'POST' && pathname === '/api/quizzes') {
        const body = await parseBody(req);
        const quiz = {
          id: Date.now(),
          title: body.title || 'Untitled Quiz',
          topic: body.topic || 'General English',
          timeLimitMinutes: Number(body.timeLimitMinutes || 10),
          status: 'Active',
          questionIds: Array.isArray(body.questionIds) ? body.questionIds : [],
          createdAt: new Date().toISOString()
        };
        quizzes.unshift(quiz);
        return sendJson(res, 201, { quiz });
      }

      if (req.method === 'GET' && pathname === '/api/quizzes') {
        return sendJson(res, 200, { quizzes });
      }

      if (req.method === 'GET' && pathname === '/api/students') {
        return sendJson(res, 200, { students });
      }

      if (req.method === 'POST' && pathname === '/api/attempts') {
        const body = await parseBody(req);
        const correct = Number(body.correct || 0);
        const total = Number(body.total || 0);
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        const attempt = {
          id: Date.now(),
          studentName: body.studentName || 'Unknown Student',
          quizTitle: body.quizTitle || 'Untitled Quiz',
          correct,
          total,
          score,
          createdAt: new Date().toISOString()
        };
        attempts.unshift(attempt);
        return sendJson(res, 201, { attempt });
      }

      if (req.method === 'GET' && pathname === '/api/analytics/overview') {
        const scores = attempts.map(a => a.score);
        const averageScore = scores.length
          ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
          : 0;

        return sendJson(res, 200, {
          totalStudents: students.length,
          activeQuizzes: quizzes.filter(q => q.status === 'Active').length,
          averageScore,
          highestScore: scores.length ? Math.max(...scores) : 0,
          lowestScore: scores.length ? Math.min(...scores) : 0,
          completionRate: quizzes.length ? Math.min(100, Math.round((attempts.length / quizzes.length) * 100)) : 0
        });
      }

      return sendJson(res, 404, { error: 'API route not found' });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Bad request' });
    }
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Smart English Quiz App running at http://localhost:${PORT}`);
});
