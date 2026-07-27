import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MCQPractice.css";
import "../../../styles/common.css";
import {
  getMCQQuestions,
  getStudentMCQStats,
  getStudentAttempts,
  createMCQQuestion,
  deleteMCQQuestion,
  createMCQSession,
  getMCQSessions,
  deleteMCQSession,
} from "../../../service/mentorService";
import { handleApiError, showSuccess } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function MCQPractice() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sessions");
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  const mentorId = getMentorId();

  const [newSession, setNewSession] = useState({
    sessionNumber: 1,
    sessionTitle: "",
    description: "",
  });

  const [newQuestion, setNewQuestion] = useState({
    sessionId: null,
    topic: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    difficultyLevel: "MEDIUM",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "sessions") {
        const response = await getMCQSessions(mentorId, studentId);
        setSessions(response.data || []);
      } else if (activeTab === "questions" && currentSession) {
        const response = await getMCQQuestions(mentorId, studentId);
        // Filter questions for current session
        const sessionQuestions =
          response.data?.filter(
            (q) => q.sessionId === currentSession.sessionId,
          ) || [];
        setQuestions(sessionQuestions);
      } else if (activeTab === "stats") {
        const response = await getStudentMCQStats(mentorId, studentId);
        setStats(response.data || null);
      } else if (activeTab === "attempts") {
        const response = await getStudentAttempts(mentorId, studentId);
        setAttempts(response.data || []);
      }
    } catch (error) {
      handleApiError(error, "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (sessions.length >= 10) {
      handleApiError(
        {
          response: {
            data: {
              message:
                "Maximum limit of 10 practice sessions per student reached.",
            },
          },
        },
        "Cannot add more sessions",
      );
      return;
    }

    try {
      await createMCQSession(mentorId, {
        ...newSession,
        studentId: parseInt(studentId),
      });
      showSuccess("Practice session created successfully");
      setShowSessionForm(false);
      setNewSession({
        sessionNumber: sessions.length + 1,
        sessionTitle: "",
        description: "",
      });
      fetchData();
    } catch (error) {
      handleApiError(error, "Failed to create session");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();

    // Check if already at 10 questions limit
    if (questions.length >= 10) {
      handleApiError(
        {
          response: {
            data: {
              message: "Maximum limit of 10 MCQ questions per student reached.",
            },
          },
        },
        "Cannot add more questions",
      );
      return;
    }

    if (!currentSession) {
      handleApiError(
        { response: { data: { message: "Please select a session first." } } },
        "No session selected",
      );
      return;
    }

    try {
      await createMCQQuestion(mentorId, {
        ...newQuestion,
        studentId: parseInt(studentId),
        sessionId: currentSession.sessionId,
      });
      showSuccess("Question created successfully");
      setShowCreateForm(false);
      setNewQuestion({
        sessionId: currentSession.sessionId,
        topic: "",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        explanation: "",
        difficultyLevel: "MEDIUM",
      });
      fetchData();
    } catch (error) {
      handleApiError(error, "Failed to create question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteMCQQuestion(questionId);
        showSuccess("Question deleted successfully");
        fetchData();
      } catch (error) {
        handleApiError(error, "Failed to delete question");
      }
    }
  };

  return (
    <div className="mcq-practice-page">
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => navigate("/mentor/students")}
        >
          ← Back to Students
        </button>
        <h1 className="page-title">MCQ Practice</h1>
        <p className="page-subtitle">
          Manage practice questions and track progress
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "sessions" ? "active" : ""}`}
          onClick={() => setActiveTab("sessions")}
        >
          Sessions ({sessions.length}/10)
        </button>
        <button
          className={`tab ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
          disabled={!currentSession}
        >
          Questions
        </button>
        <button
          className={`tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </button>
        <button
          className={`tab ${activeTab === "attempts" ? "active" : ""}`}
          onClick={() => setActiveTab("attempts")}
        >
          Attempt History
        </button>
      </div>

      {loading ? (
        <div className="loading-text">Loading...</div>
      ) : (
        <>
          {activeTab === "sessions" && (
            <div className="sessions-section">
              <div className="section-header">
                <h2>Practice Sessions ({sessions.length}/10)</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowSessionForm(!showSessionForm)}
                  disabled={sessions.length >= 10}
                  title={
                    sessions.length >= 10
                      ? "Maximum 10 sessions limit reached"
                      : "Create new session"
                  }
                >
                  {showSessionForm ? "Cancel" : "+ New Session"}
                </button>
              </div>

              {showSessionForm && (
                <div className="create-form">
                  <form onSubmit={handleCreateSession}>
                    <div className="form-row">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Session Number (1-10)"
                        value={newSession.sessionNumber}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            sessionNumber: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Session Title"
                        value={newSession.sessionTitle}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            sessionTitle: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <textarea
                      placeholder="Description (optional)"
                      value={newSession.description}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          description: e.target.value,
                        })
                      }
                      rows="2"
                    />

                    <button type="submit" className="btn-primary">
                      Create Session
                    </button>
                  </form>
                </div>
              )}

              <div className="sessions-grid">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    No practice sessions created yet
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`session-card ${currentSession?.sessionId === session.sessionId ? "selected" : ""}`}
                      onClick={() => {
                        setCurrentSession(session);
                        setActiveTab("questions");
                      }}
                    >
                      <div className="session-header">
                        <span className="session-number">
                          Session {session.sessionNumber}
                        </span>
                        {session.isCompleted && (
                          <span className="badge-completed">✓ Completed</span>
                        )}
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Delete this session and all its questions?",
                              )
                            ) {
                              deleteMCQSession(session.sessionId).then(() => {
                                showSuccess("Session deleted");
                                fetchData();
                              });
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      <h3 className="session-title">{session.sessionTitle}</h3>
                      {session.description && (
                        <p className="session-description">
                          {session.description}
                        </p>
                      )}
                      <div className="session-stats">
                        <span>📝 {session.totalQuestions} Questions</span>
                        <span>✅ {session.completedQuestions} Completed</span>
                        <span>
                          🎯 {session.accuracyPercentage?.toFixed(0)}% Accuracy
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="questions-section">
              <div className="section-header">
                <h2>Questions ({questions.length}/10)</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  disabled={questions.length >= 10}
                  title={
                    questions.length >= 10
                      ? "Maximum 10 questions limit reached"
                      : "Create new question"
                  }
                >
                  {showCreateForm ? "Cancel" : "+ New Question"}
                </button>
              </div>

              {showCreateForm && (
                <div className="create-form">
                  <form onSubmit={handleCreateQuestion}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Topic (e.g., Mathematics)"
                        value={newQuestion.topic}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            topic: e.target.value,
                          })
                        }
                        required
                      />
                      <select
                        value={newQuestion.difficultyLevel}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            difficultyLevel: e.target.value,
                          })
                        }
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="Question"
                      value={newQuestion.questionText}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          questionText: e.target.value,
                        })
                      }
                      required
                      rows="3"
                    />

                    <div className="options-grid">
                      <input
                        type="text"
                        placeholder="Option A"
                        value={newQuestion.optionA}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            optionA: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Option B"
                        value={newQuestion.optionB}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            optionB: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Option C"
                        value={newQuestion.optionC}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            optionC: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Option D"
                        value={newQuestion.optionD}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            optionD: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <select
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="A">Correct Answer: A</option>
                      <option value="B">Correct Answer: B</option>
                      <option value="C">Correct Answer: C</option>
                      <option value="D">Correct Answer: D</option>
                    </select>

                    <textarea
                      placeholder="Explanation (optional)"
                      value={newQuestion.explanation}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          explanation: e.target.value,
                        })
                      }
                      rows="2"
                    />

                    <button type="submit" className="btn-primary">
                      Create Question
                    </button>
                  </form>
                </div>
              )}

              <div className="questions-list">
                {questions.length === 0 ? (
                  <div className="empty-state">No questions created yet</div>
                ) : (
                  questions.map((q, index) => (
                    <div key={q.questionId} className="question-card">
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <span
                          className={`difficulty ${q.difficultyLevel?.toLowerCase()}`}
                        >
                          {q.difficultyLevel}
                        </span>
                        <span className="topic">{q.topic}</span>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteQuestion(q.questionId)}
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="question-text">{q.questionText}</p>
                      <div className="options">
                        <div
                          className={
                            q.correctAnswer === "A"
                              ? "option correct"
                              : "option"
                          }
                        >
                          A. {q.optionA}
                        </div>
                        <div
                          className={
                            q.correctAnswer === "B"
                              ? "option correct"
                              : "option"
                          }
                        >
                          B. {q.optionB}
                        </div>
                        <div
                          className={
                            q.correctAnswer === "C"
                              ? "option correct"
                              : "option"
                          }
                        >
                          C. {q.optionC}
                        </div>
                        <div
                          className={
                            q.correctAnswer === "D"
                              ? "option correct"
                              : "option"
                          }
                        >
                          D. {q.optionD}
                        </div>
                      </div>
                      {q.explanation && (
                        <div className="explanation">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "stats" && stats && (
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Questions</h3>
                  <p className="stat-value">{stats.totalQuestions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Attempted</h3>
                  <p className="stat-value">{stats.attemptedQuestions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Remaining</h3>
                  <p className="stat-value">{stats.remainingQuestions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Accuracy</h3>
                  <p className="stat-value">{stats.accuracyPercentage || 0}%</p>
                </div>
                <div className="stat-card">
                  <h3>Correct</h3>
                  <p className="stat-value">{stats.correctAnswers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Incorrect</h3>
                  <p className="stat-value">{stats.incorrectAnswers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attempts" && (
            <div className="attempts-section">
              {attempts.length === 0 ? (
                <div className="empty-state">No attempts yet</div>
              ) : (
                <div className="attempts-list">
                  {attempts.map((attempt) => (
                    <div key={attempt.attemptId} className="attempt-card">
                      <div className="attempt-header">
                        <span
                          className={
                            attempt.isCorrect ? "correct" : "incorrect"
                          }
                        >
                          {attempt.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                        <span className="attempt-date">
                          {new Date(attempt.attemptedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="question-text">{attempt.questionText}</p>
                      <div className="attempt-answer">
                        <span>Selected: {attempt.selectedAnswer}</span>
                        <span>Correct: {attempt.correctAnswer}</span>
                        {attempt.timeTakenSeconds && (
                          <span>Time: {attempt.timeTakenSeconds}s</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MCQPractice;
