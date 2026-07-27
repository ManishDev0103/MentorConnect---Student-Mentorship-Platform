import React, { useState, useEffect } from "react";
import "./Feedback.css";
import {
  submitFeedback,
  getStudentFeedbacks,
  getStudentSessions,
} from "../../../service/studentservice";
import { getStudentId } from "../../../service/authService";

const feedbackOptions = [
  { label: "Communication", icon: "👍" },
  { label: "Expertise", icon: "👍" },
  { label: "Flexibility", icon: "👍" },
  { label: "Responsiveness", icon: "👍" },
  { label: "Teaching Style", icon: "👍" },
  { label: "Resources", icon: "👍" },
];

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [text, setText] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [studentFeedbacks, setStudentFeedbacks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Fetch both sessions and feedbacks
      const [sessionsResponse, feedbacksResponse] = await Promise.all([
        getStudentSessions(studentId),
        getStudentFeedbacks(studentId),
      ]);

      const sessions = sessionsResponse.data || [];
      const feedbacks = feedbacksResponse.data || [];

      setStudentFeedbacks(feedbacks);

      // Create a Set of session IDs that already have feedback
      const sessionsWithFeedback = new Set(
        feedbacks.map((fb) => fb.sessionId).filter((id) => id != null),
      );

      // Filter sessions: Must be COMPLETED and NOT in the feedback set
      const completedAndAvailable = sessions.filter(
        (s) =>
          s.status === "COMPLETED" && !sessionsWithFeedback.has(s.sessionId),
      );

      setCompletedSessions(completedAndAvailable);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const handleSessionSelect = (sessionId) => {
    const session = completedSessions.find((s) => s.sessionId === sessionId);
    setSelectedSession(sessionId);
    if (session) {
      setSelectedMentor(session.mentorId);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSession) {
      alert("Please select a session");
      return;
    }

    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    if (!text.trim()) {
      alert("Please share your feedback");
      return;
    }

    try {
      setSubmitting(true);
      const studentId = getStudentId();

      const feedbackData = {
        sessionId: selectedSession,
        mentorId: selectedMentor,
        rating: rating,
        message: text,
        likedAspects: selectedOptions.join(","),
      };

      await submitFeedback(studentId, feedbackData);

      // Reset form
      setRating(0);
      setText("");
      setSelectedOptions([]);
      setSelectedSession(null);
      setSelectedMentor(null);
      setSuccess(true);

      // Refresh feedbacks
      await fetchData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feedback-page">
        <h2>Feedback</h2>
        <p>Loading feedback form...</p>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <h2>Feedback</h2>
      <p>Share feedback about your mentorship experience</p>

      {success && (
        <div className="success-message">
          ✅ Feedback submitted successfully! Thank you for your valuable input.
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      <div className="feedback-card">
        <div className="feedback-section-title">Share Your Feedback</div>

        {completedSessions.length === 0 ? (
          <div className="no-feedback">
            <p>No completed sessions yet.</p>
            <p className="text-muted">
              Complete a session with your mentor to leave feedback.
            </p>
          </div>
        ) : (
          <>
            <div className="feedback-session-selector">
              <label className="feedback-label">
                Select a Session for Feedback
              </label>
              <div className="session-options">
                {completedSessions.map((session) => (
                  <button
                    key={session.sessionId}
                    className={`session-option ${
                      selectedSession === session.sessionId ? "selected" : ""
                    }`}
                    onClick={() => handleSessionSelect(session.sessionId)}
                  >
                    <div className="session-option-title">{session.topic}</div>
                    <div className="session-option-meta">
                      {session.mentorName} • {session.sessionDate}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="feedback-rating-row">
              <div className="feedback-label">
                How would you rate your mentorship experience?
              </div>
              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      "star" +
                      (hover >= star || rating >= star ? " filled" : "")
                    }
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    role="button"
                    tabIndex={0}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {rating > 0 ? `${rating} out of 5` : "Select a rating"}
              </span>
            </div>

            <div className="feedback-section">
              <div className="feedback-label">
                Tell us about your experience
              </div>
              <textarea
                className="feedback-textarea"
                placeholder="Share your thoughts, suggestions, or any feedback about your mentorship sessions..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
              />
              <div className="char-count">{text.length} / 500 characters</div>
            </div>

            <div className="feedback-section">
              <div className="feedback-label">What did you like the most?</div>
              <div className="feedback-options-row">
                {feedbackOptions.map((opt, idx) => (
                  <button
                    key={opt.label}
                    className={
                      "feedback-option-btn" +
                      (selectedOptions.includes(opt.label) ? " selected" : "")
                    }
                    onClick={() => toggleOption(opt.label)}
                  >
                    <span className="feedback-option-icon">{opt.icon}</span>{" "}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="feedback-submit-btn"
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              <span className="send-icon">✈️</span>{" "}
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </>
        )}
      </div>

      {studentFeedbacks.length > 0 && (
        <div className="feedback-history">
          <h3>Your Feedback History</h3>
          <div className="feedback-list">
            {studentFeedbacks.map((fb) => (
              <div key={fb.feedbackId} className="feedback-item">
                <div className="feedback-item-header">
                  <div className="feedback-item-rating">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <span key={i} className="star-small">
                        ★
                      </span>
                    ))}
                    {fb.rating < 5 &&
                      Array.from({ length: 5 - fb.rating }).map((_, i) => (
                        <span key={i} className="star-small inactive">
                          ★
                        </span>
                      ))}
                  </div>
                  <div className="feedback-item-date">
                    {new Date(fb.feedbackDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="feedback-item-message">{fb.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
