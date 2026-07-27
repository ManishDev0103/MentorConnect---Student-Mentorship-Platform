// src/pages/MentorListing/MentorListing.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./MentorListing.css";
import Navbar from "../../Component/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { getPublicMentors } from "../../service/mentorservice";
import ScheduleSessionModal from "../../Component/ScheduleSessionModal/ScheduleSessionModal";

const MentorListing = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            name,
            subject: specialization,
            rating: 0,
            reviews: 0,
            sessions: 0,
            price: m.ratePerSession ?? 0,
            desc: m.about || m.experience || m.expertise || "Experienced mentor.",
            tags,
            avatar: avatarUrl,
            avatarFallback,
            verificationStatus: m.verificationStatus || "PENDING",
          };
        });
        const finalMentors = mapped.length > 0 ? mapped : [
          {
            id: 1,
            name: "Dr. Ananya Verma",
            subject: "Full-Stack Web Development & React",
            rating: 4.9,
            reviews: 28,
            sessions: 45,
            price: 500,
            desc: "10+ years experience in Software Engineering and Web Technologies. Specializes in MERN stack, Java Spring Boot, and System Design.",
            tags: ["React", "Node.js", "Java", "System Design"],
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ananya%20Verma",
            verificationStatus: "VERIFIED",
          },
          {
            id: 2,
            name: "Prof. Rajesh Kumar",
            subject: "Data Structures & Algorithms",
            rating: 4.8,
            reviews: 34,
            sessions: 60,
            price: 600,
            desc: "Ex-Google Engineer helping CDAC students master Coding Interviews, LeetCode Problem Solving, and Core CS Fundamentals.",
            tags: ["C++", "DSA", "Algorithms", "Interview Prep"],
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Kumar",
            verificationStatus: "VERIFIED",
          },
          {
            id: 3,
            name: "Priya Sharma",
            subject: "Cloud Computing & DevOps",
            rating: 4.9,
            reviews: 19,
            sessions: 30,
            price: 550,
            desc: "AWS Certified Solutions Architect with expertise in Docker, Kubernetes, CI/CD pipelines, and microservice deployments.",
            tags: ["AWS", "Docker", "Kubernetes", "DevOps"],
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Sharma",
            verificationStatus: "VERIFIED",
          }
        ];
        setMentors(finalMentors);
      } catch (err) {
        console.warn("Using fallback mentors for demonstration:", err);
        setMentors([
          {
            id: 1,
            name: "Dr. Ananya Verma",
            subject: "Full-Stack Web Development & React",
            rating: 4.9,
            reviews: 28,
            sessions: 45,
            price: 500,
            desc: "10+ years experience in Software Engineering and Web Technologies. Specializes in MERN stack, Java Spring Boot, and System Design.",
            tags: ["React", "Node.js", "Java", "System Design"],
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ananya%20Verma",
            verificationStatus: "VERIFIED",
          },
          {
            id: 2,
            name: "Prof. Rajesh Kumar",
            subject: "Data Structures & Algorithms",
            rating: 4.8,
            reviews: 34,
            sessions: 60,
            price: 600,
            desc: "Ex-Google Engineer helping CDAC students master Coding Interviews, LeetCode Problem Solving, and Core CS Fundamentals.",
            tags: ["C++", "DSA", "Algorithms", "Interview Prep"],
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Kumar",
            verificationStatus: "VERIFIED",
          }
        ]);
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
                    <div className="mentor-price">₹{m.price}/hr</div>
                    <button
                      className="btn btn-sm mentor-book-btn"
                      onClick={() => handleBookSession(m.id)}
                    >
                      Book Session
                    </button>
                  </div>
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
