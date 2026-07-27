import React, { useState, useEffect } from "react";
import "./MCQPractice.css";
import api from "../../../service/api";
import { handleApiError, showSuccess } from "../../../utils/toast";
import { getStudentId } from "../../../service/authService";

const MCQPractice = ({ onBackToDashboard }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      if (!studentId) {
        handleApiError({
          response: { data: { message: "Student not logged in" } },
        });
        return;
      }
      const response = await api.get(`/student/${studentId}/mcq/sessions`);
      setSessions(response.data || []);
    } catch (error) {
      handleApiError(error, "Failed to load MCQ sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (session) => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      const [questionsRes, attemptsRes] = await Promise.all([
        api.get(
          `/student/${studentId}/mcq/sessions/${session.sessionId}/questions`,
        ),
        api.get(
          `/student/${studentId}/mcq/sessions/${session.sessionId}/attempts`,
        ),
      ]);

      setSelectedSession(session);
      setQuestions(questionsRes.data || []);
      setAttempts(attemptsRes.data || []);

      // Check if session is already completed
      if (session.isCompleted) {
        setTestSubmitted(true);
        calculateScore(questionsRes.data, attemptsRes.data);
      }
    } catch (error) {
      handleApiError(error, "Failed to load session questions");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (sessionQuestions, sessionAttempts) => {
    const correctCount = sessionAttempts.filter((a) => a.isCorrect).length;
    setScore(correctCount);
  };

  const startTest = () => {
    if (!selectedSession) {
      handleApiError({
        response: { data: { message: "Please select a session first" } },
      });
      return;
    }
    if (questions.length === 0) {
      handleApiError({
        response: {
          data: { message: "No questions available in this session" },
        },
      });
      return;
    }

    setTestStarted(true);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(600);
    setTestSubmitted(false);
    setShowResults(false);
  };

  const handleSelectAnswer = (optionLetter) => {
    setAnswers({
      ...answers,
      [questions[current].questionId]: optionLetter,
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const submitTest = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

      // Submit all answers
      const submissions = Object.entries(answers).map(
        ([questionId, selectedAnswer]) => ({
          questionId: parseInt(questionId),
          sessionId: selectedSession.sessionId,
          selectedAnswer,
        }),
      );

      await Promise.all(
        submissions.map((submission) =>
          api.post(`/student/${studentId}/mcq/submit`, submission),
        ),
      );

      // Reload attempts to get results
      const attemptsRes = await api.get(
        `/student/${studentId}/mcq/sessions/${selectedSession.sessionId}/attempts`,
      );
      setAttempts(attemptsRes.data || []);

      calculateScore(questions, attemptsRes.data);
      setTestSubmitted(true);
      setShowResults(true);
      showSuccess("Test submitted successfully!");

      // Refresh session to update progress
      await fetchSessions();
    } catch (error) {
      handleApiError(error, "Failed to submit answers");
    } finally {
      setLoading(false);
    }
  };

  const retakeTest = () => {
    setTestStarted(false);
    setTestSubmitted(false);
    setShowResults(false);
    setAnswers({});
    setCurrent(0);
    setSelectedSession(null);
    setQuestions([]);
    setAttempts([]);
  };

  const backToSessions = () => {
    setTestStarted(false);
    setTestSubmitted(false);
    setShowResults(false);
    setSelectedSession(null);
    setQuestions([]);
    setAttempts([]);
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testStarted, testSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getOptionValue = (question, letter) => {
    const options = {
      A: question.optionA,
      B: question.optionB,
      C: question.optionC,
      D: question.optionD,
    };
    return options[letter];
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="mcq-practice-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading MCQ sessions...</p>
        </div>
      </div>
    );
  }

  // Session selection view
  if (!selectedSession && !testStarted) {
    return (
      <div className="mcq-practice-page">
        <div className="mcq-sessions-container">
          <div className="sessions-header">
            <h2>📝 MCQ Practice Sessions</h2>
            {onBackToDashboard && (
              <button className="back-btn" onClick={onBackToDashboard}>
                ← Back to Dashboard
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="no-sessions">
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <h3>No MCQ Sessions Yet</h3>
                <p>
                  Your mentor hasn't assigned any MCQ practice sessions yet.
                </p>
                <p>Check back later!</p>
              </div>
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.map((session) => (
                <div key={session.sessionId} className="session-card">
                  <div className="session-header">
                    <span className="session-number">
                      Session {session.sessionNumber}
                    </span>
                    {session.isCompleted && (
                      <span className="completed-badge">✓ Completed</span>
                    )}
                  </div>
                  <h3 className="session-title">{session.sessionTitle}</h3>
                  <p className="session-description">{session.description}</p>

                  <div className="session-stats">
                    <div className="stat-item">
                      <span className="stat-label">Questions</span>
                      <span className="stat-value">
                        {session.totalQuestions}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Completed</span>
                      <span className="stat-value">
                        {session.completedQuestions}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Accuracy</span>
                      <span className="stat-value">
                        {session.accuracyPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <button
                    className={`session-btn ${session.isCompleted ? "review-btn" : "start-btn"}`}
                    onClick={() => loadSession(session)}
                  >
                    {session.isCompleted
                      ? "📊 Review Session"
                      : "🚀 Start Session"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session loaded but not started
  if (selectedSession && !testStarted && !testSubmitted) {
    return (
      <div className="mcq-practice-page">
        <div className="mcq-start-container">
          <h2>📝 {selectedSession.sessionTitle}</h2>
          <p className="session-desc">{selectedSession.description}</p>

          <div className="mcq-start-info">
            <div className="info-item">
              <span className="info-icon">❓</span>
              <div>
                <div className="info-label">Total Questions</div>
                <div className="info-value">{questions.length}</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <div>
                <div className="info-label">Time Limit</div>
                <div className="info-value">10 Minutes</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⭐</span>
              <div>
                <div className="info-label">Session</div>
                <div className="info-value">
                  #{selectedSession.sessionNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="mcq-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>You have {questions.length} questions in this session</li>
              <li>Total time available: 10 minutes</li>
              <li>Cannot pause the timer once started</li>
              <li>You can navigate between questions</li>
              <li>Submit your answers before time expires</li>
              <li>Results will be shown immediately after submission</li>
            </ul>
          </div>

          <div className="mcq-button-row">
            <button className="mcq-back-btn" onClick={backToSessions}>
              ← Back to Sessions
            </button>
            <button className="mcq-start-btn" onClick={startTest}>
              🚀 Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  if (testStarted && !testSubmitted && questions.length > 0) {
    const currentQuestion = questions[current];
    const currentAnswer = answers[currentQuestion.questionId];

    return (
      <div className="mcq-practice-page">
        <div className="mcq-test-container">
          <div className="test-header">
            <div className="test-progress">
              Question {current + 1} of {questions.length}
            </div>
            <div className="test-timer">⏱️ {formatTime(timeLeft)}</div>
          </div>

          <div className="question-card">
            <div className="question-topic">{currentQuestion.topic}</div>
            <div className="question-text">{currentQuestion.questionText}</div>

            <div className="mcq-options">
              {["A", "B", "C", "D"].map((letter, idx) => (
                <div
                  key={letter}
                  className={`mcq-option ${currentAnswer === letter ? "selected" : ""}`}
                  onClick={() => handleSelectAnswer(letter)}
                >
                  <span className="mcq-option-label">{letter}</span>
                  <span className="mcq-option-text">
                    {getOptionValue(currentQuestion, letter)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="question-nav">
            <button
              className="nav-btn"
              onClick={handlePrevious}
              disabled={current === 0}
            >
              ← Previous
            </button>

            <div className="question-indicators">
              {questions.map((_, idx) => (
                <span
                  key={idx}
                  className={`indicator ${idx === current ? "active" : ""} ${
                    answers[questions[idx].questionId] ? "answered" : ""
                  }`}
                  onClick={() => setCurrent(idx)}
                >
                  {idx + 1}
                </span>
              ))}
            </div>

            {current === questions.length - 1 ? (
              <button className="submit-btn" onClick={submitTest}>
                Submit Test
              </button>
            ) : (
              <button className="nav-btn" onClick={handleNext}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (testSubmitted || showResults) {
    const percentage =
      questions.length > 0 ? ((score / questions.length) * 100).toFixed(1) : 0;

    return (
      <div className="mcq-practice-page">
        <div className="mcq-results-container">
          <h2>📊 Test Results</h2>
          <div className="results-summary">
            <div className="result-circle">
              <div className="result-score">
                {score}/{questions.length}
              </div>
              <div className="result-percentage">{percentage}%</div>
            </div>
            <div className="result-details">
              <div className="result-item">
                <span className="result-label">Correct Answers:</span>
                <span className="result-value correct">{score}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Wrong Answers:</span>
                <span className="result-value wrong">
                  {questions.length - score}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy:</span>
                <span className="result-value">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className="results-message">
            {percentage >= 80 && (
              <>
                <span className="result-icon">🎉</span>
                <h3>Excellent Work!</h3>
                <p>You've done a great job! Keep it up!</p>
              </>
            )}
            {percentage >= 60 && percentage < 80 && (
              <>
                <span className="result-icon">👍</span>
                <h3>Good Job!</h3>
                <p>You're doing well. Keep practicing!</p>
              </>
            )}
            {percentage < 60 && (
              <>
                <span className="result-icon">📚</span>
                <h3>Keep Learning!</h3>
                <p>Practice makes perfect. Try again!</p>
              </>
            )}
          </div>

          <div className="mcq-button-row">
            <button className="mcq-back-btn" onClick={backToSessions}>
              ← Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MCQPractice;
