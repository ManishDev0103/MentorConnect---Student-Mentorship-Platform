// src/components/Navbar/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../API/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (hasRole("student")) {
      navigate("/student-dashboard");
    } else if (hasRole("mentor")) {
      navigate("/mentor");
    } else if (hasRole("admin")) {
      navigate("/admin-dashboard");
    }
  };

  return (
    <nav className="mp-navbar shadow-sm">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Logo / Brand */}
        <Link
  to="/"
  className="mp-logo-wrapper d-flex align-items-center text-decoration-none"
>
  <img
    src="/images/mclogo.png"
    alt="MentorConnect Logo"
    className="mp-logo me-2"
  />

  <span className="mp-brand">
    MentorConnect
  </span>
</Link>

        {/* Nav Links */}
        <ul className="mp-nav-links d-none d-md-flex">
          <li>
            <a href="/#features">Features</a>
          </li>
          <li>
            <a href="/#how-it-works">How It Works</a>
          </li>
          <li>
            <a href="/#pricing">Pricing</a>
          </li>
          {!isAuthenticated && (
            <li>
              <Link to="/mentors">Browse Mentors</Link>
            </li>
          )}
          <li>
            <Link to="/testimonials">Testimonials</Link>
          </li>
          <li>
            <Link to="/complaint">Support</Link>
          </li>
        </ul>

        {/* Sign In / Logout Button */}
        <div>
          {isAuthenticated ? (
            <div className="d-flex gap-2 align-items-center">
              <button
                onClick={handleDashboardClick}
                className="btn mp-signin-btn"
                style={{ marginRight: "10px" }}
              >
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn mp-signin-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
