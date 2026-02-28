# Smart English Quiz App – Product Specification

## 1. Product Vision
Build an AI-powered assessment platform for English teachers that converts lesson content into high-quality quizzes, automates grading, and provides actionable learning analytics for classrooms.

## 2. Primary Users
- **Teacher/Admin**: Creates and manages quizzes, students, and performance insights.
- **Student**: Attempts assigned quizzes and tracks personal progress.

## 3. End-to-End Flow
1. Teacher uploads/pastes lesson content.
2. AI generates question sets based on selected controls.
3. Questions are saved to a reusable Question Bank.
4. Teacher creates and schedules a quiz.
5. Students attempt quiz via student portal.
6. System auto-grades and stores attempts permanently.
7. Teacher reviews dashboard analytics and exports reports.

---

## 4. Teacher/Admin Panel Requirements

### 4.1 AI Quiz Generator (Core Module)

#### Inputs
- Paste lesson text.
- Upload file:
  - PDF
  - DOCX

#### Generation Controls
- Difficulty: Easy / Medium / Hard
- Question type:
  - Vocabulary meaning
  - Synonym/Antonym
  - Fill in the blanks
  - Best preposition
  - Error detection
  - Sentence improvement
  - Mixed
- Number of questions
- Time limit per quiz
- Shuffle questions (toggle)
- Shuffle options (toggle)
- Marks per question
- Negative marking (optional)
- Bloom’s taxonomy level (optional)

#### AI Output Expectations
- Grammatically correct questions.
- One clearly correct option for MCQs.
- Distractors should be plausible.
- Difficulty aligned with selected level.
- Editable output before publishing.

### 4.2 Question Bank
- Auto-save all generated questions.
- CRUD support:
  - Create manual question
  - Edit question
  - Delete question
  - Reuse question in new quizzes
- Tagging system (examples: Preposition, Tense, Grade 8).
- Filter/search by:
  - Topic/tag
  - Difficulty
  - Question type
  - Created date

### 4.3 Quiz Management
Each quiz stores:
- Title
- Topic
- Created date
- Deadline
- Status: Draft / Active / Expired
- Assigned students/classes

Teacher actions:
- Assign to specific students
- Assign to whole class
- Assign to multiple classes
- Schedule start and end time
- Lock quiz after submission
- Allow reattempt (optional)
- Attempt limit

### 4.4 Dashboard & Analytics

#### Overview Widgets
- Total students
- Active quizzes
- Average class score
- Highest / Lowest score
- Completion rate (%)

#### Deep Analytics
- Question-wise analysis (most-missed questions)
- Topic-wise performance (weak area detection)
- Student ranking leaderboard
- Progress-over-time graph by student/class

### 4.5 Export & Download
Teacher can download:
- Quiz paper (PDF)
- Individual attempt report (PDF)
- Class performance report (PDF)
- Excel reports containing:
  - Student name
  - Attempt date
  - Score
  - Accuracy %
  - Time taken
  - Question analytics summary

### 4.6 Student Management
- Add student manually
- Bulk upload students via Excel
- Class/section assignment
- Reset password
- Deactivate student
- View individual progress history

### 4.7 Records & Storage
- Permanent attempt storage
- Filters by date, student, topic
- Archive old quizzes

---

## 5. Student Panel Requirements

### 5.1 Authentication
- Login with email + password
- Forgot password flow

### 5.2 Assigned Quizzes View
- Upcoming
- Active
- Expired
- Completed

### 5.3 Quiz Attempt Experience
- Timer
- One-question-per-page mode (optional)
- Progress bar
- Flag question for review
- Auto-submit on timeout
- Optional exam mode (restrict back navigation)

### 5.4 Results & Feedback
Student sees:
- Total score
- Correct answers
- Wrong answers
- Explanation/solution per question
- Time taken
- Comparison with class average

### 5.5 Downloads
- Attempt PDF
- Performance summary PDF

---

## 6. Suggested Data Model (High Level)

### Core Entities
- `users` (teacher, student, admin)
- `classes`
- `student_class_map`
- `question_bank`
- `question_tags`
- `quiz`
- `quiz_questions`
- `quiz_assignment`
- `attempt`
- `attempt_answers`
- `analytics_snapshots`
- `exports_log`

### Key Relationships
- One teacher → many quizzes
- One quiz → many questions
- One student → many attempts
- One question → many tags

---

## 7. Non-Functional Requirements
- **Scalability**: support concurrent quiz attempts during class hours.
- **Reliability**: autosave attempt progress every few seconds.
- **Security**:
  - Password hashing
  - Role-based access control
  - Signed URLs for downloads
- **Auditability**: activity logs for quiz edits and grading events.
- **Performance**:
  - Dashboard load < 2s for common classes
  - Quiz page transitions < 300ms on broadband

---

## 8. MVP vs Phase-2 Plan

### MVP (Recommended First Release)
- AI quiz generation from text + PDF
- Question bank with edit/reuse/tagging
- Quiz assignment + scheduling
- Student attempt flow with timer + auto-submit
- Auto grading
- Basic dashboard (avg score, completion, top/bottom)
- PDF/Excel exports

### Phase 2
- Bloom’s taxonomy controls
- DOCX + richer parsing options
- Advanced proctor/exam mode
- Trend forecasting and weak-skill predictions
- Multi-school tenancy support

---

## 9. Acceptance Criteria Snapshot
- Teacher can generate a quiz from uploaded lesson in < 60 seconds.
- At least 90% of generated MCQs pass teacher review without major correction.
- Student results are available immediately after submission.
- Question-wise and topic-wise analytics are visible for every completed quiz.
- Teacher can export class report as both PDF and Excel.
