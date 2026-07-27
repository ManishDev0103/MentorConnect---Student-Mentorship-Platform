import React, { useState, useEffect } from "react";
import "./BrowseMentors.css";
import { getVerifiedMentors } from "../../../service/studentservice";
import { getStudentId } from "../../../service/authService";
import ScheduleSessionModal from "../../../Component/ScheduleSessionModal/ScheduleSessionModal";
import { useNavigate } from "react-router-dom";

const BrowseMentors = ({ onBack, onNavigateToSubscriptions }) => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  // Modal States
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMentorId, setBookingMentorId] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchQuery, selectedDomain, mentors]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      console.log("DEBUG: Fetching mentors for Student ID:", studentId);

      const response = await getVerifiedMentors(studentId);
      const data = response.data || [];
      setMentors(data);
      setFilteredMentors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      // Check for 500 error which might be the RuntimeException from backend
      if (
        err.response &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.includes("Active subscription required")
      ) {
        console.log("DEBUG: Caught Subscription Error");
        setError(
          "You need an active subscription to browse mentors. Please upgrade your plan.",
        );
      } else {
        setError("Failed to load mentors. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let result = [...mentors];

    // Filter by search query (Name or Specialization)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          (m.specialization &&
            m.specialization.toLowerCase().includes(query)) ||
          (m.expertise && m.expertise.toLowerCase().includes(query)),
      );
    }

    // Filter by Domain
    if (selectedDomain !== "All") {
      result = result.filter(
        (m) =>
          m.specialization === selectedDomain || m.expertise === selectedDomain,
      );
    }

    setFilteredMentors(result);
  };

  const handleUpgradeClick = () => {
    // Option 1: Try callback if provided
    if (onNavigateToSubscriptions) {
      onNavigateToSubscriptions();
    }
    // Option 2: Fallback to URL navigation
    navigate("/student-dashboard?tab=Subscriptions");
  };

  // Extract unique domains for filter dropdown
  const domains = [
    "All",
    ...new Set(mentors.map((m) => m.specialization).filter(Boolean)),
  ];

  const handleOpenProfile = (mentor) => {
    setSelectedMentor(mentor);
    setShowProfileModal(true);
  };

  const handleBookSession = (mentorId) => {
    setBookingMentorId(mentorId);
    setShowBookingModal(true);
    setShowProfileModal(false); // Close profile if open
  };

  return (
    <div className="browse-mentors-container">
      <h2>Browse Mentors</h2>
      <p className="subtitle">
        Find and connect with industry experts to accelerate your learning.
      </p>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, skill, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            {domains.map((domain, idx) => (
              <option key={idx} value={domain}>
                {domain === "All" ? "All Domains" : domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Finding the best mentors for you...</p>
        </div>
      ) : error ? (
        <div className="error-message-container">
          <div className="error-message">⚠️ {error}</div>
          {error.includes("active subscription") && (
            <button className="upgrade-plan-btn" onClick={handleUpgradeClick}>
              Upgrade Plan 🚀
            </button>
          )}
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="no-results">
          <h3>No mentors found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="mentors-grid">
          {filteredMentors.map((mentor) => (
            <div key={mentor.mentorId} className="mentor-card">
              <div className="mentor-card-header">
                <img
                  src={`https://ui-avatars.com/api/?name=${mentor.name}&background=random&size=128`}
                  alt={mentor.name}
                  className="mentor-avatar"
                />
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <div className="mentor-domain">
                    {mentor.specialization || "General"}
                  </div>
                  <div className="mentor-experience">
                    {mentor.experience} Exp
                  </div>
                </div>
              </div>

              <div className="mentor-card-body">
                <div className="mentor-rating">
                  <span style={{ color: "#ffc107" }}>⭐</span>
                  {mentor.rating ? parseFloat(mentor.rating).toFixed(1) : "N/A"}
                  <span
                    style={{
                      fontWeight: "normal",
                      color: "#888",
                      fontSize: "12px",
                      marginLeft: "4px",
                    }}
                  >
                    (Rating)
                  </span>
                </div>
                <div className="mentor-about">
                  {mentor.about ||
                    "Experienced professional ready to mentor students."}
                </div>
              </div>

              <div className="mentor-card-footer">
                <div className="mentor-price">
                  ₹{mentor.ratePerSession || 500} <span>/ session</span>
                </div>
                <button
                  className="view-profile-btn"
                  onClick={() => handleOpenProfile(mentor)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedMentor && (
        <div
          className="mentor-modal-overlay"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="mentor-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-banner">
              <button
                className="modal-close-btn"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-content">
              <div className="modal-profile-info">
                <img
                  src={`https://ui-avatars.com/api/?name=${selectedMentor.name}&background=random&size=128`}
                  alt={selectedMentor.name}
                  className="modal-avatar"
                />
                <h2 className="modal-name">{selectedMentor.name}</h2>
                <div className="modal-domain">
                  {selectedMentor.specialization}
                </div>
              </div>

              <div className="modal-stats-row">
                <div className="stat-item">
                  <div className="stat-value">
                    ⭐ {selectedMentor.rating || "N/A"}
                  </div>
                  <div className="stat-label">Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {selectedMentor.experience || "N/A"}
                  </div>
                  <div className="stat-label">Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    ₹{selectedMentor.ratePerSession || 500}
                  </div>
                  <div className="stat-label">Per Session</div>
                </div>
              </div>

              <div className="modal-section">
                <h4>👤 About</h4>
                <p style={{ lineHeight: "1.6", color: "#555" }}>
                  {selectedMentor.about ||
                    `${selectedMentor.name} is a ${selectedMentor.specialization} expert with ${selectedMentor.experience} of experience.`}
                </p>
              </div>

              <div className="modal-section">
                <h4>📧 Contact</h4>
                <p style={{ color: "#555" }}>
                  {selectedMentor.email || "Email not available"}
                </p>
              </div>

              <button
                className="book-session-cta"
                onClick={() => handleBookSession(selectedMentor.mentorId)}
              >
                📅 Book Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <ScheduleSessionModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingMentorId(null);
        }}
        onSessionScheduled={() => {
          setShowBookingModal(false);
        }}
        preselectedMentorId={bookingMentorId}
      />
    </div>
  );
};

export default BrowseMentors;
