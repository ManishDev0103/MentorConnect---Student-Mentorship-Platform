// src/pages/MentorListing/MentorListing.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./MentorListing.css";
import Navbar from "../../Component/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { getPublicMentors } from "../../service/mentorservice";
import ScheduleSessionModal from "../../Component/ScheduleSessionModal/ScheduleSessionModal";
import DemoPlayer from "../../Component/MentorComponents/DemoPlayer";

const MentorListing = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDemoUserId, setOpenDemoUserId] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPublicMentors(search || null);
        const list = response?.data || [];
        const mapped = list.map((m) => {
          const name = m.name || "Mentor";
          const specialization = m.specialization || "General";
          const tags = m.expertise
            ? m.expertise.split(/[,|]/).map((t) => t.trim()).filter(Boolean)
            : specialization ? [specialization] : [];
          const avatarFallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
          const avatarUrl = m.userId
            ? `http://localhost:8080/api/users/image/${m.userId}`
            : avatarFallback;

          return {
            id: m.mentorId,
            userId: m.userId,
            name,
            subject: specialization,
            rating: m.rating ?? 0,
            reviews: m.reviews ?? 0,
            sessions: m.sessions ?? 0,
            price: m.ratePerSession ?? 0,
            discountPercent: m.discountPercent ?? 0,
            finalPrice: m.finalPrice ?? (m.ratePerSession ?? 0),
            desc: m.about || m.experience || m.expertise || "Experienced mentor.",
            tags,
            avatar: avatarUrl,
            avatarFallback,
            verificationStatus: m.verificationStatus || "PENDING",
          };
        });
        setMentors(mapped);
      } catch (err) {
        console.warn("Unable to load mentors:", err);
        setMentors([]);
        setError("Unable to load mentors at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleBookSession = (mentorId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setSelectedMentorId(mentorId);
    setIsModalOpen(true);
  };

  const visibleMentors = useMemo(() => {
    if (!search) return mentors;
    const term = search.toLowerCase();
    return mentors.filter((m) =>
      [m.name, m.subject, m.desc, ...(m.tags || [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [mentors, search]);


  return (
    <div className="mentor-page-root">
      <Navbar />

      <section className="mentor-listing-section">
        <div className="container">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h1 className="mentor-heading">Find Your Perfect Mentor</h1>
              <p className="mentor-subtitle">
                Browse verified mentors for UPSC, JEE, NEET, CAT and more.
              </p>
            </div>
          </div>

          {/* Search + Filters (static for now) */}
          <div className="mentor-filters mb-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search by name, exam, specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-7 d-flex flex-wrap gap-3 justify-content-md-end">
                <button className="btn filter-btn">
                  Filters: <span className="filter-label">All Exams</span>
                </button>
                <button className="btn filter-btn">
                  <span className="filter-label">All Specializations</span>
                </button>
                <button className="btn filter-btn">
                  <span className="filter-label">All Ratings</span>
                </button>
              </div>
            </div>
          </div>

          <p className="showing-text">
            {loading ? "Loading mentors..." : `Showing ${visibleMentors.length} mentors`}
          </p>

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          {/* Mentor Cards */}
          <div className="row g-4">
            {visibleMentors.map((m) => (
              <div className="col-md-6 col-lg-4" key={m.id}>
                <div className="mentor-card">
                  <div className="mentor-card-header">
                    <span className={`badge-verified ${m.verificationStatus !== "VERIFIED" ? "badge-pending" : ""}`}>
                      {m.verificationStatus === "VERIFIED" ? "Verified" : "Pending"}
                    </span>
                    <div className="mentor-avatar-wrap">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="mentor-avatar"
                        onError={(e) => {
                          e.currentTarget.src = m.avatarFallback;
                        }}
                      />
                    </div>
                    <h5 className="mentor-name">{m.name}</h5>
                    <p className="mentor-subject">{m.subject}</p>
                    <div className="mentor-rating">
                      <span className="star">★</span>
                      <span className="rating-score">{m.rating}</span>
                      <span className="rating-details">
                        ({m.reviews}) · {m.sessions} sessions
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mentor-desc mt-3">{m.desc}</p>

                  {/* Tags */}
                  <div className="mentor-tags">
                    {m.tags.map((tag) => (
                      <span className="mentor-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price + button */}
                  <div className="mentor-footer">
                    <div className="mentor-price">
                      {m.discountPercent > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>₹{m.price}</span>
                          <span style={{ color: '#b91c1c', fontWeight: 700 }}>₹{m.finalPrice}</span>
                          <div style={{ fontSize: 12, color: '#10b981', marginLeft: 8 }}>{m.discountPercent}% OFF</div>
                        </>
                      ) : (
                        <>₹{m.price}/hr</>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm mentor-book-btn"
                        onClick={() => handleBookSession(m.id)}
                      >
                        Book Session
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          setOpenDemoUserId((current) =>
                            current === m.userId ? null : m.userId,
                          )
                        }
                      >
                        {openDemoUserId === m.userId ? 'Close Demo' : 'View Demo'}
                      </button>
                    </div>
                  </div>
                  {openDemoUserId === m.userId && (
                    <div className="mt-3">
                      <DemoPlayer
                        mentorUserId={m.userId}
                        onClose={() => setOpenDemoUserId(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <ScheduleSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedMentorId={selectedMentorId}
        onSessionScheduled={() => {
          setIsModalOpen(false);
          // Optional: Refresh mentor list or show confirmation
        }}
      />
    </div>
  );
};

export default MentorListing;
