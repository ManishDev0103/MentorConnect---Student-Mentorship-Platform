import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentDashboard.css";
import MyMentor from "../MyMentor/MyMentor";
import MySessions from "../MySessions/MySessions";
import MCQPractice from "../MCQPractice/MCQPractice";
import Subscriptions from "../Subscriptions/Subscriptions";
import Feedback from "../Feedback/Feedback";
import EditProfileModal from "./EditProfileModal";
import StudentProfile from "../StudentProfile";
import StudyTimer from "../StudyTimer/StudyTimer"; // Import StudyTimer
import BrowseMentors from "../BrowseMentors/BrowseMentors";
import StudentChatModal from "../../../Component/StudentComponents/ChatModal/StudentChatModal";
import { getStudentDashboard } from "../../../service/studentservice";
import { getStudentId, clearStudentAuth } from "../../../service/authService";
import { useDarkMode } from "../../../context/DarkModeContext";

const sidebarItems = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Profile", icon: "👤" },
  { label: "My Mentor", icon: "👩‍🏫" },
  { label: "Browse Mentors", icon: "🔍" },
  { label: "My Sessions", icon: "📅" },
  { label: "Messages", icon: "💬" },
  { label: "MCQ Practice", icon: "📝" },
  { label: "Study Timer", icon: "⏱️" },
  { label: "Subscriptions", icon: "💳" },
  { label: "Feedback", icon: "💬" },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [initialMentorId, setInitialMentorId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    let studentIdFromStorage = getStudentId();

    if (!studentIdFromStorage) {
      setLoading(false);
      setError("Student ID not found. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    setStudentId(studentIdFromStorage);
    fetchDashboard(studentIdFromStorage);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mentorIdFromUrl = params.get("mentorId");
    const tabFromUrl = params.get("tab");

    if (mentorIdFromUrl) {
      setInitialMentorId(Number(mentorIdFromUrl));
      setActiveTab(tabFromUrl || "My Mentor");
    } else if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const fetchDashboard = async (id) => {
    try {
      setLoading(true);
      const res = await getStudentDashboard(id);
      console.log("Dashboard Response:", res.data);
      setDashboard(res.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setDashboard({
        totalSessions: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        totalSpent: 0,
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearStudentAuth();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`student-dashboard ${isDarkMode ? 'dark-mode' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar student-sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-box">
            <div className="logo-circle">
              <div className="logo-dot" />
            </div>
          </div>
          <div>
            <div className="logo-title">Mentorship</div>
            <div className="logo-subtitle">Personalized</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={"sidebar-item" + (activeTab === item.label ? " active" : "")}
              onClick={() => setActiveTab(item.label)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-logout">
          <button className="btn btn-light w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">
        <div className="d-flex justify-content-end mb-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Show Menu" : "Hide Menu"}
            title={sidebarCollapsed ? "Show Menu" : "Hide Menu"}
          >
            {sidebarCollapsed ? "☰" : "◀"}
          </button>
        </div>
        {error && (
          <div className="alert-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <>
            <div className="dashboard-header">
              <div>
                <h1>Student Dashboard</h1>
                <p>Your session analytics</p>
              </div>
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>

            {dashboard ? (
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-label">Total Sessions</div>
                  <div className="stat-value">
                    {dashboard.totalSessions || 0}
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Upcoming Sessions</div>
                  <div className="stat-value">
                    {dashboard.upcomingSessions || 0}
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Completed Sessions</div>
                  <div className="stat-value">
                    {dashboard.completedSessions || 0}
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Total Spent (₹)</div>
                  <div className="stat-value">
                    ₹ {dashboard.totalSpent || 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="stats-row">
                <p>Unable to load dashboard statistics.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "Profile" && <StudentProfile />}
        {activeTab === "My Mentor" && (
          <MyMentor
            initialMentorId={initialMentorId}
            onNavigateToDashboard={() => setActiveTab("Browse Mentors")}
          />
        )}
        {activeTab === "Browse Mentors" && (
          <BrowseMentors
            onBack={() => setActiveTab("My Mentor")}
            onNavigateToSubscriptions={() => setActiveTab("Subscriptions")}
          />
        )}
        {activeTab === "My Sessions" && <MySessions />}
        {activeTab === "Messages" && (
          <StudentChatModal
            isOpen={true}
            onClose={() => setActiveTab("Dashboard")}
            studentId={studentId}
          />
        )}
        {activeTab === "MCQ Practice" && (
          <MCQPractice onBackToDashboard={() => setActiveTab("Dashboard")} />
        )}
        {activeTab === "Study Timer" && <StudyTimer />}
        {activeTab === "Subscriptions" && (
          <Subscriptions onBackToDashboard={() => setActiveTab("Dashboard")} />
        )}
        {activeTab === "Feedback" && <Feedback />}

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={fetchDashboard}
        />
      </main>
    </div>
  );
};

export default StudentDashboard;
