import { useState, useEffect } from "react";
import "./Feedback.css";
import "../../../styles/common.css";
import { getFeedback, getAverageRating } from "../../../service/mentorService";
import { handleApiError } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get mentor ID from localStorage (set during login)
  const mentorId = getMentorId();

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [feedbackResponse, ratingResponse] = await Promise.all([
        getFeedback(mentorId),
        getAverageRating(mentorId),
      ]);

      if (feedbackResponse.success) {
        setFeedback(feedbackResponse.data || []);
      }

      if (ratingResponse.success && ratingResponse.data !== null) {
        setAverageRating(ratingResponse.data);
      }
    } catch (error) {
      handleApiError(error, "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="feedback-page">
      <div className="page-header">
        <h1 className="page-title">Student Feedback</h1>
        <p className="page-subtitle">Review feedback from your students</p>
        {averageRating > 0 && (
          <div className="average-rating-badge">
            Average Rating: {averageRating.toFixed(1)} ⭐
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-text">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="empty-state">
          <p>No feedback received yet</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedback.map((f, i) => (
            <div className="feedback-card" key={i}>
              <div className="feedback-header">
                <div className="feedback-user">
                  <div className="feedback-avatar">
                    {getInitials(f.studentName)}
                  </div>
                  <div className="feedback-user-info">
                    <div className="feedback-name">{f.studentName}</div>
                    <div className="feedback-date">
                      {formatDate(f.feedbackDate)}
                    </div>
                  </div>
                </div>
                <div className="feedback-rating">
                  {[...Array(5)].map((_, idx) => (
                    <span
                      key={idx}
                      className={`star ${idx < f.rating ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="feedback-msg">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feedback;
