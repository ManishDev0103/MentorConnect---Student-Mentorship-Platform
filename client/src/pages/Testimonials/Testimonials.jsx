import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Component/Navbar/Navbar";
import { getRecentPlatformFeedback } from "../../service/testimonialService";
import "../Home/Home.css";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await getRecentPlatformFeedback(12);
        setTestimonials(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to load testimonials", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  return (
    <div className="home-root">
      <Navbar />
      <section className="testimonial-section py-5">
        <div className="container text-center">
          <h2 className="section-heading">Student Testimonials</h2>
          <p className="section-subtitle">
            Hear from learners who have grown with MentorConnect.
          </p>

          {loading ? (
            <div className="testimonial-card mx-auto">
              <p>Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="testimonial-card mx-auto">
              <p>No testimonials are available right now.</p>
              <Link to="/register/student" className="btn hero-cta-primary mt-3">
                Share Your Feedback
              </Link>
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
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
