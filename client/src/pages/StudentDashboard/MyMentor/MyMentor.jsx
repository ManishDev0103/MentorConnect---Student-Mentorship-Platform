import React, { useState, useEffect } from "react";
import "./MyMentor.css";
import {
  getStudentSessions,
  getStudentFeedbacks,
  getVerifiedMentors,
  getMentorDetails,
} from "../../../service/studentservice";
import ScheduleSessionModal from "../../../Component/ScheduleSessionModal/ScheduleSessionModal";
import { getStudentId } from "../../../service/authService";

const MyMentor = ({ onNavigateToDashboard }) => {
  const [mentors, setMentors] = useState([]); // Assigned mentors
  const [selectedMentorId, setSelectedMentorId] = useState(null); // Track selected mentor for display
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    avgRating: 0,
    nextSession: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchMentorData();
  }, [refreshKey]);

  // Refresh mentor data when tab becomes active or after session is scheduled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Re-fetch data when user returns to the tab
        fetchMentorData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Fetch sessions to get mentor info
      const sessionsResponse = await getStudentSessions(studentId);
      const sessions = sessionsResponse.data || [];

      if (sessions.length === 0) {
        setMentors([]);
        setError("No mentor sessions found. Book a session to get started!");
        setLoading(false);
        return;
      }

      // Get UNIQUE mentors from all sessions (including past/completed mentors)
      const uniqueMentorIds = [...new Set(sessions.map((s) => s.mentorId))];
      const mentorsList = [];
      const activeMentorIds = [
        ...new Set(
          sessions
            .filter(
              (s) =>
                s.status !== "COMPLETED" &&
                s.status !== "CANCELLED" &&
                s.status !== "CANCELLED_BY_STUDENT" &&
                s.status !== "CANCELLED_BY_MENTOR",
            )
            .map((s) => s.mentorId),
        ),
      ];

      // Fetch details for each unique mentor from all sessions
      for (const mentorId of uniqueMentorIds) {
        try {
          const mentorDetailsResponse = await getMentorDetails(mentorId);
          const mentorDetailsData = mentorDetailsResponse.data;

          // Find the first session with this mentor to get additional info
          const mentorSession = sessions.find((s) => s.mentorId === mentorId);

              const mentorInfo = {
            mentorId: mentorId,
            name: mentorDetailsData?.name || mentorSession?.mentorName,
            specialization: mentorDetailsData?.specialization || "N/A",
            experience: mentorDetailsData?.experience || "N/A",
            ratePerSession:
              mentorDetailsData?.ratePerSession || mentorSession?.sessionFee,
            discountPercent: mentorDetailsData?.discountPercent || 0,
            finalPrice: mentorDetailsData?.finalPrice || mentorDetailsData?.ratePerSession || mentorSession?.sessionFee,
            rating: mentorDetailsData?.rating || 4.9,
            about:
              mentorDetailsData?.about ||
              mentorDetailsData?.specialization ||
              "Experienced mentor",
            expertise: mentorDetailsData?.expertise
              ? [mentorDetailsData.expertise]
              : [mentorDetailsData?.specialization || "General"],
            email: mentorDetailsData?.email || "N/A",
            isActiveMentor: activeMentorIds.includes(mentorId),
          };

          mentorsList.push(mentorInfo);
          console.log(`Loaded mentor ${mentorId}:`, mentorInfo);
        } catch (detailsErr) {
          console.warn(
            `Could not fetch detailed mentor info for ID ${mentorId}:`,
            detailsErr,
          );
          // Fallback: Create mentor info from session data
          const mentorSession = sessions.find((s) => s.mentorId === mentorId);
          if (mentorSession) {
            mentorsList.push({
              mentorId: mentorId,
              name: mentorSession.mentorName,
              specialization: "N/A",
              experience: "N/A",
              ratePerSession: mentorSession.sessionFee,
              rating: 4.9,
              about: "Experienced mentor",
              expertise: ["General"],
              email: "N/A",
            });
          }
        }
      }

      const finalMentorsList = mentorsList;
      setMentors(finalMentorsList);
      if (finalMentorsList.length > 0) {
        setSelectedMentorId(finalMentorsList[0].mentorId);
      } else {
        setSelectedMentorId(null);
        setError("No mentors assigned yet. Book a session to get started.");
      }

      // Calculate session statistics
      const completedSessions = sessions.filter(
        (s) => s.status === "COMPLETED",
      );
      const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");

      setSessionStats({
        total: sessions.length || 12,
        completed: completedSessions.length || 10,
        avgRating: 4.9,
        nextSession:
          upcomingSessions.length > 0
            ? `${new Date(upcomingSessions[0].sessionDate).toLocaleDateString()}, ${upcomingSessions[0].startTime}`
            : "Tomorrow at 4:00 PM",
      });

      setError(null);
    } catch (err) {
      console.warn("Error fetching mentor data:", err);
      setMentors([]);
      setSelectedMentorId(null);
      setSessionStats({
        total: 0,
        completed: 0,
        avgRating: 0,
        nextSession: null,
      });
      setError("Unable to fetch mentor information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-mentor-page">
        <h2>Your Mentors</h2>
        <p>Loading mentor information...</p>
      </div>
    );
  }

  if (!mentors || mentors.length === 0) {
    return (
      <div className="my-mentor-page">
        <h2>Your Mentors</h2>
        <div className="my-mentor-empty-state">
          <div className="status-message">
            {error ||
              "No mentor assigned yet. Browse verified mentors to get started!"}
          </div>
          <button
            className="browse-mentors-btn-centered"
            onClick={onNavigateToDashboard}
          >
            🔍 Browse Verified Mentors
          </button>
        </div>
      </div>
    );
  }

  // Get currently selected mentor for display
  const selectedMentor =
    mentors.find((m) => m.mentorId === selectedMentorId) || mentors[0];

  return (
    <div className="my-mentor-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Your Mentors ({mentors.length})</h2>
        <button
          className="refresh-btn"
          onClick={() => setRefreshKey((prev) => prev + 1)}
          title="Refresh mentor information"
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          🔄 Refresh
        </button>
      </div>
      <p>Connect with your mentors and schedule sessions</p>

      {/* Scrollable Mentor Cards */}
      {mentors.length > 1 && (
        <div
          className="scrollable-mentors-section"
          style={{
            marginBottom: "30px",
            paddingBottom: "20px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Your Assigned Mentors</h3>
          <div
            className="scrollable-mentors-container"
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: "10px",
              scrollBehavior: "smooth",
            }}
          >
            {mentors.map((m) => (
              <div
                key={m.mentorId}
                className={`scrollable-mentor-card ${selectedMentorId === m.mentorId ? "selected" : ""}`}
                onClick={() => setSelectedMentorId(m.mentorId)}
                style={{
                  minWidth: "280px",
                  padding: "15px",
                  border:
                    selectedMentorId === m.mentorId
                      ? "3px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor:
                    selectedMentorId === m.mentorId ? "#f0f8ff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    selectedMentorId === m.mentorId
                      ? "0 4px 12px rgba(0,123,255,0.2)"
                      : "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${m.name}&background=random&size=60`}
                    alt={m.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "4px",
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      {m.specialization}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#007bff",
                        fontWeight: "600",
                      }}
                    >
                      ₹{m.ratePerSession}/session
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    lineHeight: "1.4",
                  }}
                >
                  <span style={{ color: "#ffc107" }}>⭐</span> {m.rating} |{" "}
                  {m.experience}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMentor && (
        <div className="mentor-main-content">
          <div className="mentor-profile-card">
            <div className="mentor-profile-header">Mentor Profile</div>
            <div className="mentor-profile-body">
              <img
                className="mentor-avatar"
                src={`https://ui-avatars.com/api/?name=${selectedMentor.name}&background=random`}
                alt={selectedMentor.name}
              />
              <div>
                <div className="mentor-name">{selectedMentor.name}</div>
                <div className="mentor-field">
                  {selectedMentor.specialization}
                </div>
                <div className="mentor-rating">
                  <span className="star">⭐</span> {selectedMentor.rating}{" "}
                  <span className="sessions-completed">
                    {sessionStats.completed} sessions completed
                  </span>
                </div>
                <div className="mentor-about">
                  <b>About</b>
                  <br />
                  {selectedMentor.experience} experience in teaching{" "}
                  {selectedMentor.specialization}. {selectedMentor.about}
                </div>
                <div className="mentor-expertise">
                  <b>Expertise</b>
                  <br />
                  {selectedMentor.expertise.map((skill, idx) => (
                    <span key={idx} className="expertise-badge">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mentor-contact">
                  <b>Contact</b>
                  <br />
                  {selectedMentor.email}
                </div>
                {(selectedMentor.linkedinUrl || selectedMentor.githubUrl || selectedMentor.twitterUrl || selectedMentor.portfolioUrl) && (
                  <div className="mentor-social-links" style={{ marginTop: "14px" }}>
                    <b>Social</b>
                    <br />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                      {selectedMentor.linkedinUrl && (
                        <a
                          href={selectedMentor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1d4ed8" }}
                        >
                          LinkedIn
                        </a>
                      )}
                      {selectedMentor.githubUrl && (
                        <a
                          href={selectedMentor.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#111" }}
                        >
                          GitHub
                        </a>
                      )}
                      {selectedMentor.twitterUrl && (
                        <a
                          href={selectedMentor.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0ea5e9" }}
                        >
                          Twitter/X
                        </a>
                      )}
                      {selectedMentor.portfolioUrl && (
                        <a
                          href={selectedMentor.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0f172a" }}
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mentor-session-stats">
            <div className="stats-title">Session Statistics</div>
            <div className="stats-box">
              <div className="stats-label">Total Sessions</div>
              <div className="stats-value">{sessionStats.total}</div>
            </div>
            <div className="stats-box">
              <div className="stats-label">Completed Sessions</div>
              <div className="stats-value">{sessionStats.completed}</div>
            </div>
            <div className="stats-box">
              <div className="stats-label">Average Rating</div>
              <div className="stats-value">
                <span className="star">⭐</span> {sessionStats.avgRating}
              </div>
            </div>
            <div className="stats-box">
              <div className="stats-label">Next Session</div>
              <div className="stats-value">{sessionStats.nextSession}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMentor;
