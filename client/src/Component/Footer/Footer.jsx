import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { apiPublic } from "../../service/api";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email address to subscribe.");
      return;
    }

    setIsSubmitting(true);
    apiPublic
      .post("/api/newsletter/subscribe", { email: normalizedEmail })
      .then((response) => {
        setEmail("");
        toast.success(response.data?.message || "You are subscribed to MentorConnect updates.");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "We could not complete your subscription.");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="container">
          <div className="site-footer-grid">
            <section className="site-footer-brand" aria-labelledby="footer-brand-heading">
              <Link to="/" className="site-footer-logo" aria-label="MentorConnect home">
                <img src="/images/mclogo.png" alt="" />
                <span id="footer-brand-heading">MentorConnect</span>
              </Link>
              <p>
                Practical mentorship for students building confidence, skills, and a clear path
                forward.
              </p>
              <div className="site-footer-socials" aria-label="Social media links">
                <a href="https://instagram.com/mentorconnect" target="_blank" rel="noreferrer" aria-label="Instagram">
                  ig
                </a>
                <a href="https://x.com/mentorconnect" target="_blank" rel="noreferrer" aria-label="X">
                  X
                </a>
                <a href="https://youtube.com/@mentorconnect" target="_blank" rel="noreferrer" aria-label="YouTube">
                  yt
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  in
                </a>
              </div>
            </section>

            <nav className="site-footer-links" aria-label="Platform links">
              <h2>Platform</h2>
              <Link to="/mentors">Browse mentors</Link>
              <Link to="/testimonials">Success stories</Link>
              <Link to="/register/student">Join as a student</Link>
              <Link to="/register/mentor">Become a mentor</Link>
            </nav>

            <nav className="site-footer-links" aria-label="Support links">
              <h2>Support</h2>
              <Link to="/complaint">Help center</Link>
              <Link to="/complaint">Report an issue</Link>
              <a href="tel:+919876543210">+91 98765 43210</a>
              <a href="mailto:support@mentorconnect.dev">support@mentorconnect.dev</a>
            </nav>

            <section className="site-footer-newsletter" aria-labelledby="newsletter-heading">
              <p className="site-footer-eyebrow">Stay in the loop</p>
              <h2 id="newsletter-heading">Useful guidance, once a week.</h2>
              <p>Get mentorship tips, learning resources, and platform updates in your inbox.</p>
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <label className="sr-only" htmlFor="footer-newsletter-email">
                  Email address
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Subscribe"}
                </button>
              </form>
              <small>By subscribing, you agree to receive MentorConnect updates.</small>
            </section>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="container site-footer-bottom-inner">
          <span>© {new Date().getFullYear()} MentorConnect. All rights reserved.</span>
          <span>Built for focused learning and meaningful connections.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
