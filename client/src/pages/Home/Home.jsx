// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import "./Home.css";
import Navbar from "../../Component/Navbar/Navbar";
import { Link } from "react-router-dom";
import { getRecentPlatformFeedback } from "../../service/testimonialService";

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await getRecentPlatformFeedback(3);
        setTestimonials(response?.data?.data || []);
      } catch (error) {
        console.warn("Unable to load testimonials", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="home-root">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center gy-4">
            {/* Text */}
            <div className="col-lg-6">
              <div className="hero-brand-pill">
                <img src="/images/mclogo.png" alt="MentorConnect logo" className="hero-brand-logo" />
                <span>MentorConnect • Personalized learning</span>
              </div>
              <h1 className="hero-title">
                Your MentorConnect Journey Starts Here
              </h1>
              <p className="hero-subtitle">
                Connect with verified mentors for WebDevelopment, DevOps, Cybersecurity & more.
                Track your progress and achieve your learning goals with structured guidance.
              </p>

              <div className="hero-badges">
                <Link to="/mentors" className="hero-badge" title="Explore live mentorship">
                  Live mentorship
                </Link>
                <Link to="/mentors" className="hero-badge" title="View session-based notes support">
                  Session-based notes
                </Link>
                <Link to="/mentors" className="hero-badge" title="See progress analytics features">
                  Progress analytics
                </Link>
              </div>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/mentors" className="btn hero-cta-primary">
                  Find a Mentor
                </Link>
                <Link to="/register/mentor" className="btn hero-cta-secondary">
                  Become a Mentor
                </Link>
              </div>
            </div>

            {/* Illustration / visual card */}
            <div className="col-lg-6">
              <div className="hero-visual-shell">
                <div className="hero-image-wrapper">
                  <img
                    src="/images/mcmain.png"
                    alt="Mentor Guiding Student"
                    className="img-fluid hero-image"
                  />
                </div>
                <div className="hero-float-card hero-float-card-1">
                  <strong>1:1 mentoring</strong>
                  <span>Clear sessions and accountable progress.</span>
                </div>
                <div className="hero-float-card hero-float-card-2">
                  <strong>PDF note sharing</strong>
                  <span>Share support material during each session.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="features-section">
        <div className="container text-center">
          <h2 className="section-heading">Key Features</h2>
          <p className="section-subtitle">
            Everything you need for exam-focused mentorship in India
          </p>

          <div className="row g-4 mt-3">
            <div className="col-md-3">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h5>Track Progress</h5>
                <p>
                  Monitor your preparation for WebDevelopment, DevOps, Cybersecurity & more with
                  detailed analytics.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h5>1-on-1 Mentorship</h5>
                <p>
                  Connect with selected mentors – ex-MCC, IITians,
                  founders, and toppers.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h5>Analytics</h5>
                <p>
                  Visualize your consistency, revision cycles, and test scores
                  week by week.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h5>MCQ & Mains Practice</h5>
                <p>
                  Practice with curated MCQs and answer-writing for major
                  courses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (simple 3-step) */}
      <section id="how-it-works" className="how-section">
        <div className="container text-center">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-subtitle">
            A simple, structured journey from confusion to clarity
          </p>

          <div className="row g-4 mt-3">
            <div className="col-md-4">
              <div className="how-card">
                <span className="step-badge">1</span>
                <h5>Create your profile</h5>
                <p>
                  Share your exam, target year, and study schedule. We keep it
                  simple and focused.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="how-card">
                <span className="step-badge">2</span>
                <h5>Match with a mentor</h5>
                <p>
                  Get paired with mentors who know the Indian exam landscape
                  inside out.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="how-card">
                <span className="step-badge">3</span>
                <h5>Track & improve</h5>
                <p>
                  Use our timer, targets, and analytics to stay accountable
                  every single day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section">
        <div className="container text-center">
          <h2 className="section-heading">What Our Users Say</h2>
          <p className="section-subtitle">
            Real stories from learners across India
          </p>

          {loadingTestimonials ? (
            <div className="testimonial-card mx-auto">
              <p>Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="testimonial-card mx-auto">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar-circle me-3">AS</div>
                <div className="text-start">
                  <h6 className="mb-0">Manish Kadam</h6>
                  <small className="text-muted">Atlassian</small>
                </div>
              </div>
              <p className="testimonial-text">
                “MentorConnect paired me with an excellent mentor who
                helped me structure my coding skills. The daily
                tracking and feedback keep me consistent even on tough days.”
              </p>
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {testimonials.map((testimonial) => (
                <div className="col-md-4" key={testimonial.feedbackId}>
                  <div className="testimonial-card">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar-circle me-3">
                        {testimonial.initials || "ST"}
                      </div>
                      <div className="text-start">
                        <h6 className="mb-0">{testimonial.studentName || "Student"}</h6>
                        <small className="text-muted">
                          {testimonial.rating ? `⭐ ${testimonial.rating} / 5` : "Student feedback"}
                        </small>
                      </div>
                    </div>
                    <p className="testimonial-text">{testimonial.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingTestimonials && testimonials.length > 0 && (
            <div className="text-center mt-4">
              <Link to="/testimonials" className="btn hero-cta-secondary">
                View more testimonials
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Pricing anchor (simple placeholder) */}
      <section id="pricing" className="pricing-placeholder-section">
        <div className="container text-center">
          <h2 className="section-heading">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">
            Start free, upgrade only when you need 1-on-1 mentorship.
          </p>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="cta-section">
        <div className="container text-center text-white">
          <h2 className="cta-heading">Ready to Start Your Journey?</h2>
          <p className="cta-subtitle">
            Join thousands of students preparing for WebDevelopment, DevOps, Cybersecurity & more
            with guided mentorship.
          </p>
          <Link to="/register/student" className="btn cta-btn">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer / About / Contact */}
      <section className="home-footer-section">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-4">
              <div className="footer-panel">
                <h3 className="footer-heading">About Us</h3>
                <p className="footer-text">
                  MentorConnect is a mentorship-focused learning platform that connects students
                  with experienced mentors for structured guidance, session tracking, progress
                  reviews, and personalized support across professional and technical learning paths.
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="footer-panel">
                <h3 className="footer-heading">Contact Us</h3>
                <ul className="footer-contact-list">
                  <li>
                    <span className="footer-label">Phone:</span>
                    <a href="tel:+919876543210">+91 98765 43210</a>
                  </li>
                  <li>
                    <span className="footer-label">Instagram:</span>
                    <a href="https://instagram.com/mentorconnect" target="_blank" rel="noreferrer">
                      @mentorconnect
                    </a>
                  </li>
                  <li>
                    <span className="footer-label">X:</span>
                    <a href="https://x.com/mentorconnect" target="_blank" rel="noreferrer">
                      @mentorconnect
                    </a>
                  </li>
                  <li>
                    <span className="footer-label">YouTube:</span>
                    <a href="https://youtube.com/@mentorconnect" target="_blank" rel="noreferrer">
                      MentorConnect Channel
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="footer-panel footer-flag-panel">
                <div className="india-flag" aria-hidden="true">
                  <span className="flag-saffron" />
                  <span className="flag-white" />
                  <span className="flag-green" />
                  <span className="flag-chakra" />
                </div>
                <div className="footer-developers">
                  <p className="footer-text">Developed by</p>
                  <h4 className="developer-names">
                    Manjiree Mule, Shraddha Shinde, Manish Kadam and Varad Mane
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mp-footer text-center">
        © {new Date().getFullYear()} Mentorship Personalized. All rights
        reserved.
      </footer>
    </div>
  );
};

export default Home;
