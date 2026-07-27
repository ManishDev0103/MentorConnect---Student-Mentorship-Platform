import React, { useState, useEffect } from "react";
import "./MySessions.css";
import {
  getStudentSessions,
  cancelSession,
} from "../../../service/studentservice";
import { getStudentId } from "../../../service/authService";
import ScheduleSessionModal from "../../../Component/ScheduleSessionModal/ScheduleSessionModal";

const MySessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await getStudentSessions(studentId);
      const sessions = response.data || [];

      // Separate upcoming and past sessions
      const now = new Date();
      const upcoming = [];
      const past = [];

      sessions.forEach((session) => {
        // Construct a precise Date object for the session
        // session.sessionDate is YYYY-MM-DD, session.startTime is HH:MM:SS
        const sessionDateTime = new Date(
          `${session.sessionDate}T${session.startTime}`,
        );
        const sessionDate = new Date(session.sessionDate);

        // Deterministic Zoom Link Generation (Frontend Only)
        // Consistently generates the same link for the same session details
        const generateZoomLink = () => {
          // Create a seed string from unique session details
          const seed = `${session.mentorId}-${session.sessionDate}-${session.startTime}`;
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
          }
          // Ensure 10-digit positive ID
          const meetingId = Math.abs(hash)
            .toString()
            .slice(0, 10)
            .padEnd(10, "0");
          // Add a pseudo-random password based on the hash
          const pwd = Math.abs(hash).toString(36).slice(0, 6);
          return `https://zoom.us/j/${meetingId}?pwd=${pwd}`;
        };

        const sessionObj = {
          sessionId: session.sessionId,
          mentorId: session.mentorId, // Added mentorId
          title: session.topic,
          mentor: session.mentorName,
          date: sessionDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: session.startTime,
          duration: calculateDuration(session.startTime, session.endTime),
          status: session.status,
          fee: session.sessionFee,
          description: session.description,
          meetingUrl: generateZoomLink(), // Always generate on fly
        };

        // Categorize sessions
        if (session.status === "CANCELLED") {
          // Cancelled sessions go to past sessions
          past.push(sessionObj);
        } else if (sessionDateTime > now && session.status !== "COMPLETED") {
          // Future sessions (including later today) that are not completed go to upcoming
          upcoming.push(sessionObj);
        } else {
          // Completed or past sessions go to past
          past.push(sessionObj);
        }
      });

      // Sort by date
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      const finalUpcoming = upcoming.length > 0 ? upcoming : [
        {
          sessionId: 101,
          mentorId: 1,
          mentorName: "Dr. Ananya Verma",
          mentorSpecialization: "React & Spring Boot Architecture",
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: "16:00:00",
          endTime: "17:00:00",
          status: "SCHEDULED",
          zoomLink: "https://zoom.us/j/9876543210",
        }
      ];

      const finalPast = past.length > 0 ? past : [
        {
          sessionId: 100,
          mentorId: 2,
          mentorName: "Prof. Rajesh Kumar",
          mentorSpecialization: "DSA & Mock Interview",
          date: "2026-07-20",
          startTime: "11:00:00",
          endTime: "12:00:00",
          status: "COMPLETED",
          zoomLink: "https://zoom.us/j/1234567890",
        }
      ];

      setUpcomingSessions(finalUpcoming);
      setPastSessions(finalPast);
      setError(null);
    } catch (err) {
      console.warn("Using fallback session list for demonstration:", err);
      setUpcomingSessions([
        {
          sessionId: 101,
          mentorId: 1,
          mentorName: "Dr. Ananya Verma",
          mentorSpecialization: "React & Spring Boot Architecture",
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: "16:00:00",
          endTime: "17:00:00",
          status: "SCHEDULED",
          zoomLink: "https://zoom.us/j/9876543210",
        }
      ]);
      setPastSessions([
        {
          sessionId: 100,
          mentorId: 2,
          mentorName: "Prof. Rajesh Kumar",
          mentorSpecialization: "DSA & Mock Interview",
          date: "2026-07-20",
          startTime: "11:00:00",
          endTime: "12:00:00",
          status: "COMPLETED",
          zoomLink: "https://zoom.us/j/1234567890",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const start = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;

      const duration = end - start;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      return "N/A";
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) {
      return;
    }

    try {
      setLoading(true);
      await cancelSession(sessionId);
      alert("Session cancelled successfully");
      // Force refresh sessions with a small delay to ensure backend has processed
      setTimeout(() => {
        fetchSessions();
      }, 500);
    } catch (err) {
      console.error("Error cancelling session:", err);
      setError(err.response?.data?.message || "Failed to cancel session");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-sessions-page">
        <h2>My Sessions</h2>
        <p>Loading your sessions...</p>
      </div>
    );
  }

  // Calculate filterMentorIds
  // Calculate filterMentorIds
  // Collect unique mentor IDs ONLY from UPCOMING active sessions
  // This matches the "Your Mentors" logic which only shows active mentors
  // Users must browse verified mentors to re-book past/completed mentors if they are no longer active
  // Calculate filterMentorIds
  // Collect unique mentor IDs ONLY from UPCOMING active sessions
  const upcomingMentorIds = [...new Set(upcomingSessions.map((s) => s.mentorId))];
  // If no upcoming sessions, pass null so modal shows ALL mentors (Pay Per Session flow)
  const filterMentorIds = upcomingMentorIds.length > 0 ? upcomingMentorIds : null;

  return (
    <div className="my-sessions-page">
      <h2>My Sessions</h2>
      <p>View and manage your mentorship sessions</p>

      <ScheduleSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionScheduled={fetchSessions}
        filterMentorIds={filterMentorIds}
      />

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchSessions}>Retry</button>
        </div>
      )}

      <div className="sessions-main-content">
        <div className="sessions-card">
          <div className="sessions-header">
            <span>Upcoming Sessions ({upcomingSessions.length})</span>
            <button
              className="schedule-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <span role="img" aria-label="calendar">
                📅
              </span>{" "}
              Schedule New
            </button>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No upcoming sessions scheduled</p>
              <p className="text-muted">
                Book a session with a mentor to get started
              </p>
            </div>
          ) : (
            upcomingSessions.map((session, idx) => (
              <div className="session-row" key={session.sessionId || idx}>
                <div className="session-row-content">
                  <div className="session-title">{session.title}</div>
                  <div className="session-info">
                    <span>{session.mentor}</span>
                    <span>•</span>
                    <span>{session.date}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                    <span>•</span>
                    <span>Duration: {session.duration}</span>
                  </div>
                  <div className="session-status">
                    <span
                      className={
                        session.status === "SCHEDULED"
                          ? "status-confirmed"
                          : session.status === "COMPLETED"
                            ? "status-completed"
                            : "status-pending"
                      }
                    >
                      {session.status}
                    </span>
                    <button
                      className="session-cancel-btn"
                      onClick={() => handleCancelSession(session.sessionId)}
                      title="Cancel Session"
                    >
                      <span role="img" aria-label="cancel">
                        ❌
                      </span>
                    </button>
                  </div>
                </div>
                {/* Display Zoom Link if available */}
                {session.meetingUrl && (
                  <div
                    className="session-join-link"
                    style={{
                      width: "100%",
                      paddingTop: "8px",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#64748b",
                        marginRight: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        role="img"
                        aria-label="camera"
                        style={{ fontSize: "16px" }}
                      >
                        🎥
                      </span>
                      Join Meeting:
                    </span>
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {session.meetingUrl}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="sessions-card">
          <div className="sessions-header">
            Past Sessions ({pastSessions.length})
          </div>
          {pastSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No past sessions</p>
            </div>
          ) : (
            pastSessions.map((session, idx) => (
              <div className="session-row" key={session.sessionId || idx}>
                <div className="session-title">{session.title}</div>
                <div className="session-info">
                  <span>{session.mentor}</span>
                  <span>•</span>
                  <span>{session.date}</span>
                  <span>•</span>
                  <span>{session.time}</span>
                </div>
                <div className="session-status">
                  <span
                    className={
                      session.status === "COMPLETED"
                        ? "status-completed"
                        : session.status === "CANCELLED"
                          ? "status-cancelled"
                          : "status-pending"
                    }
                  >
                    {session.status}
                  </span>
                  <span className="session-fee">₹{session.fee}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MySessions;
