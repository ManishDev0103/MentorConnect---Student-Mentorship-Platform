import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Component/Navbar/Navbar";
import { getMentorDetails } from "../../service/studentservice";
import "./MentorPublicProfile.css";

const MentorPublicProfile = () => {
  const { mentorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(location.state?.mentor || null);
  const [loading, setLoading] = useState(!location.state?.mentor);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentor && mentorId) {
      const fetchMentor = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await getMentorDetails(mentorId);
          const mentorData = response?.data;

          if (!mentorData) {
            throw new Error("Mentor details unavailable.");
          }

          setMentor({
            mentorId: mentorData.mentorId || mentorId,
            name: mentorData.name || mentorData.fullName || "Mentor",
            subject: mentorData.specialization || mentorData.expertise || "General",
            rating: mentorData.rating ?? 0,
            reviews: mentorData.reviews ?? mentorData.reviewCount ?? 0,
            sessions: mentorData.sessions ?? mentorData.sessionCount ?? 0,
            price: mentorData.ratePerSession ?? mentorData.price ?? 0,
            discountPercent: mentorData.discountPercent ?? 0,
            finalPrice:
              mentorData.finalPrice ?? mentorData.ratePerSession ?? mentorData.price ?? 0,
            desc:
              mentorData.about || mentorData.experience || mentorData.expertise ||
              "Experienced mentor ready to support your journey.",
            tags: mentorData.expertise
              ? mentorData.expertise.split(/[,|]/).map((tag) => tag.trim()).filter(Boolean)
              : [mentorData.specialization || "General"],
            avatar: mentorData.userId
              ? `http://localhost:8080/api/users/image/${mentorData.userId}`
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  mentorData.name || mentorData.fullName || "Mentor",
                )}`,
            email: mentorData.email || mentorData.contactEmail || "Not available",
          });
        } catch (fetchError) {
          console.error("Failed to load mentor profile:", fetchError);
          setError(
            "Unable to load this mentor's profile right now. Please try again later.",
          );
        } finally {
          setLoading(false);
        }
      };
      fetchMentor();
    }
  }, [mentor, mentorId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="mentor-profile-page">
        <Navbar />
        <div className="mentor-profile-loading">
          <div className="spinner" />
          <p>Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentor-profile-page">
        <Navbar />
        <div className="mentor-profile-error">
          <p>{error}</p>
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mentor-profile-page">
        <Navbar />
        <div className="mentor-profile-empty">
          <p>No mentor profile available.</p>
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-profile-page">
      <Navbar />
      <div className="mentor-profile-container">
        <button className="back-button" onClick={handleBack}>
          ← Back to Mentors
        </button>

        <div className="mentor-profile-card">
          <div className="mentor-profile-hero">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="mentor-profile-avatar"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  mentor.name,
                )}`;
              }}
            />
            <div className="mentor-profile-info">
              <h1>{mentor.name}</h1>
              <p className="mentor-profile-subject">{mentor.subject}</p>
              <div className="mentor-profile-meta">
                <span>⭐ {mentor.rating.toFixed(1)}</span>
                <span>{mentor.reviews} reviews</span>
                <span>{mentor.sessions} sessions</span>
              </div>
            </div>
          </div>

          <div className="mentor-profile-details">
            <div className="mentor-profile-section">
              <h2>About</h2>
              <p>{mentor.desc}</p>
            </div>

            <div className="mentor-profile-section">
              <h2>Expertise</h2>
              <div className="mentor-tags-row">
                {mentor.tags.map((tag) => (
                  <span className="mentor-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mentor-profile-section mentor-contact-section">
              <h2>Contact</h2>
              <p>{mentor.email}</p>
            </div>

            <div className="mentor-profile-section mentor-pricing-section">
              <h2>Pricing</h2>
              <div className="mentor-pricing-grid">
                <div>
                  <span className="pricing-label">Price</span>
                  <span className="pricing-value">₹{mentor.finalPrice}</span>
                </div>
                {mentor.discountPercent > 0 && (
                  <div>
                    <span className="pricing-label">Discount</span>
                    <span className="pricing-value">{mentor.discountPercent}% OFF</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPublicProfile;
