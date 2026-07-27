import React, { useState, useEffect } from "react";
import "./PerformanceLeaderboards.css";
import { adminDashboardService } from "../../../service/adminDashboardService";

const TopListItem = ({
  idx,
  title,
  subtitle,
  meta,
  score,
  highlight,
  scoreClass,
}) => (
  <div className={`pl-item ${highlight ? "pl-item--highlight" : ""}`}>
    <div className="pl-item__left">
      <div className="pl-item__rank">{title}</div>
      <div className="pl-item__meta">
        <div className="pl-item__name">{subtitle}</div>
        <div className="pl-item__subtext">{meta}</div>
      </div>
    </div>
    <div className={`pl-item__score ${scoreClass || ""}`}>⭐ {score}</div>
  </div>
);

export const PerformanceLeaderboards = () => {
  const [topMentors, setTopMentors] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [longestStreaks, setLongestStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);

      let mentorsData = [];
      let studentsData = [];
      let streaksData = [];

      try {
        mentorsData = await adminDashboardService.getTopMentors(5);
      } catch (err) {
        console.error("Error fetching top mentors:", err);
      }

      try {
        studentsData = await adminDashboardService.getTopStudents(5);
      } catch (err) {
        console.error("Error fetching top students:", err);
      }

      try {
        streaksData = await adminDashboardService.getLongestActivityStreaks(4);
      } catch (err) {
        console.error("Error fetching activity streaks:", err);
      }

      setTopMentors(mentorsData || []);
      setTopStudents(studentsData || []);
      setLongestStreaks(streaksData || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="pl-root p-4">
      <div className="pl-header mb-4">
        <h2 className="pl-title">Performance Leaderboards</h2>
        <p className="pl-subtitle">Top performers and active contributors</p>
      </div>

      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <div className="row g-3">
        {/* Top Mentors */}
        <div className="col-lg-6">
          <div className="card shadow-sm pl-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-heading">🏆 Top Rated Mentors</h5>
                <span className="text-muted small">By Rating</span>
              </div>

              <div className="pl-list">
                {topMentors.length > 0 ? (
                  topMentors.map((m, i) => (
                    <TopListItem
                      key={m.mentorId || i}
                      idx={i}
                      title={i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                      subtitle={m.name || "Unknown"}
                      meta=""
                      score={(m.rating || 0).toFixed(1)}
                      highlight={i < 3}
                      scoreClass="pl-score--yellow"
                    />
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    No mentor data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="col-lg-6">
          <div className="card shadow-sm pl-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-heading">⭐ Most Active Students</h5>
                <span className="text-muted small">By Sessions</span>
              </div>

              <div className="pl-list">
                {topStudents.length > 0 ? (
                  topStudents.map((s, i) => (
                    <TopListItem
                      key={s.studentId || i}
                      idx={i}
                      title={i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                      subtitle={s.name || "Unknown"}
                      meta={s.targetDomain || ""}
                      score={s.sessionsCompleted || 0}
                      highlight={i < 3}
                      scoreClass="pl-score--blue"
                    />
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    No student data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Longest Streaks */}
        <div className="col-12">
          <div className="card shadow-sm pl-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-heading">🔥 Longest Activity Streaks</h5>
                <span className="text-muted small">Consecutive Days</span>
              </div>

              <div className="row g-3">
                {longestStreaks.length > 0 ? (
                  longestStreaks.map((item, index) => (
                    <div
                      key={item.activityStreakId || item.userId || index}
                      className="col-md-3"
                    >
                      <div className="streak-card">
                        <div className="streak-value">
                          {item.streakDays || item.streak || 0}
                        </div>
                        <div className="streak-name">
                          {item.userName || item.name || "Unknown"}
                        </div>
                        <div
                          className={`streak-type ${item.userType === "MENTOR" || item.type === "Mentor" || item.type === "MENTOR"
                              ? "type-mentor"
                              : "type-student"
                            }`}
                        >
                          {item.userType || item.type || "User"}
                        </div>
                        <div className="streak-last text-muted">
                          {item.lastActiveDate || item.lastActive || "Recently"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center text-muted py-4">
                    No streak data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceLeaderboards;
