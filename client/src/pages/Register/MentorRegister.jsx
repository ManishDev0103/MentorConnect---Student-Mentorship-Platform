import React, { useState } from "react";
import "./Registration.css";
import { Link, useNavigate } from "react-router-dom";
import { registerMentor } from "../../API/authService";
import { showSuccess, showError } from "../../utils/toast";
import {
  getPasswordStrength,
  passwordMeetsPolicy,
  getPasswordRequirementItems,
  getPasswordStrengthColor,
} from "../../utils/passwordUtils";

const MentorRegister = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    phoneNo: "",
    specialization: "",
    customSpecialization: "",
    experience: "",
    ratePerSession: "",
    discountPercent: "",
    highestEducation: "",
    currentPosition: "",
    organization: "",
    professionalBio: "",
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
    portfolioUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      // Validate required fields
      if (!form.firstName || !form.email || !form.password || !form.confirmPassword || !form.specialization || !form.experience || !form.ratePerSession || !form.highestEducation || !form.currentPosition || !form.organization || !form.professionalBio) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }
      if (form.linkedinUrl && !isValidUrl(form.linkedinUrl)) {
        setError("Please enter a valid LinkedIn URL");
        setLoading(false);
        return;
      }
      if (form.githubUrl && !isValidUrl(form.githubUrl)) {
        setError("Please enter a valid GitHub URL");
        setLoading(false);
        return;
      }
      if (form.twitterUrl && !isValidUrl(form.twitterUrl)) {
        setError("Please enter a valid Twitter/X URL");
        setLoading(false);
        return;
      }
      if (form.portfolioUrl && !isValidUrl(form.portfolioUrl)) {
        setError("Please enter a valid Portfolio or Website URL");
        setLoading(false);
        return;
      }

      if (!passwordMeetsPolicy(form.password)) {
        setError(
          "Password must be 8-20 characters and include uppercase, lowercase, number, and special character"
        );
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (form.specialization === "Other" && !form.customSpecialization.trim()) {
        setError("Please provide a custom specialization when \'Other\' is selected");
        setLoading(false);
        return;
      }

      if (form.professionalBio.length < 50) {
        setError("Professional Bio must be at least 50 characters long");
        setLoading(false);
        return;
      }

      // Validate passwords match
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate rate is a valid number
      const rate = parseFloat(form.ratePerSession);
      if (isNaN(rate) || rate <= 0) {
        setError("Please enter a valid rate per session");
        setLoading(false);
        return;
      }

      // Call backend signup
      const signupData = {
        firstName: form.firstName,
        lastName: form.lastName || "",
        email: form.email,
        password: form.password,
        dob: form.dob || null,
        address: form.address || "",
        phoneNo: form.phoneNo || "",
        specialization: form.specialization,
        customSpecialization: form.customSpecialization || "",
        experience: form.experience,
        ratePerSession: rate,
        discountPercent: form.discountPercent ? parseFloat(form.discountPercent) : 0,
        highestEducation: form.highestEducation,
        currentPosition: form.currentPosition,
        organization: form.organization,
        professionalBio: form.professionalBio,
        linkedinUrl: form.linkedinUrl || "",
        githubUrl: form.githubUrl || "",
        twitterUrl: form.twitterUrl || "",
        portfolioUrl: form.portfolioUrl || "",
      };

      await registerMentor(signupData);
      showSuccess("Mentor application submitted successfully! Your account is pending admin verification.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err?.message || "Registration failed. Please try again.";
      setError(msg);
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "UI/UX Design",
    "Business Analysis",
    "Other",
  ];

  const experiences = [
    "0-2 years",
    "3-5 years",
    "6-10 years",
    "10+ years",
  ];

  return (
    <div className="register-page d-flex align-items-center justify-content-center">
      <div className="register-card register-card-wide">
        <div className="register-icon-wrapper">
          <div className="register-icon register-icon-mentor">🎓</div>
        </div>

        <h1 className="register-title text-center">Become a Mentor</h1>
        <p className="register-subtitle text-center">
          Share your expertise and help shape the next generation of learners
        </p>

        <div className="info-banner">
          All applications are reviewed and verified by our admin team
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <h5 className="section-title mt-4">Personal Information</h5>
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label">First Name *</label>
              <input
                name="firstName"
                type="text"
                className="form-control register-input"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                name="lastName"
                type="text"
                className="form-control register-input"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email Address *</label>
              <input
                name="email"
                type="email"
                className="form-control register-input"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                name="dob"
                type="date"
                className="form-control register-input"
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone Number (with country code)</label>
              <input
                name="phoneNo"
                type="tel"
                className="form-control register-input"
                placeholder="+91 98765 43210"
                value={form.phoneNo}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input
                name="address"
                type="text"
                className="form-control register-input"
                placeholder="Your address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Password *</label>
              <div className="input-group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control register-input"
                  placeholder="At least 8 characters, uppercase, lowercase, number, special char"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary password-toggle-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M3 3l18 18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="password-strength-bar mt-2">
                <div
                  className="password-strength-fill"
                  style={{
                    width: `${(getPasswordStrength(form.password).score / 5) * 100}%`,
                    background: getPasswordStrengthColor(
                      getPasswordStrength(form.password).score
                    ),
                  }}
                />
              </div>
              <small className="text-muted">
                {getPasswordStrength(form.password).label}
              </small>
            </div>

            <div className="col-md-6">
              <label className="form-label">Confirm Password *</label>
              <div className="input-group">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control register-input"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-label="Confirm password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary password-toggle-btn"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-pressed={showConfirmPassword}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M3 3l18 18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Professional Information */}
          <h5 className="section-title">Professional Information</h5>
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label">Area of Specialization *</label>
              <select
                name="specialization"
                className="form-select register-input"
                value={form.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select your specialization</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            {form.specialization === "Other" && (
              <div className="col-md-6">
                <label className="form-label">Custom Specialization *</label>
                <input
                  name="customSpecialization"
                  type="text"
                  className="form-control register-input"
                  placeholder="Describe your specialization"
                  value={form.customSpecialization}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label">Years of Experience *</label>
              <select
                name="experience"
                className="form-select register-input"
                value={form.experience}
                onChange={handleChange}
                required
              >
                <option value="">Select years of experience</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Rate Per Session (₹) *</label>
              <input
                name="ratePerSession"
                type="number"
                className="form-control register-input"
                placeholder="e.g., 500"
                value={form.ratePerSession}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Discount Percent (%)</label>
              <input
                name="discountPercent"
                type="number"
                className="form-control register-input"
                placeholder="e.g., 10"
                value={form.discountPercent}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          {/* Additional Professional Details */}
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label">Highest Education *</label>
              <input
                name="highestEducation"
                type="text"
                className="form-control register-input"
                placeholder="e.g., M.Tech, PhD"
                value={form.highestEducation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Current Position *</label>
              <input
                name="currentPosition"
                type="text"
                className="form-control register-input"
                placeholder="e.g., Senior Engineer"
                value={form.currentPosition}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Organization *</label>
              <input
                name="organization"
                type="text"
                className="form-control register-input"
                placeholder="e.g., Google, Amazon, Self-Employed"
                value={form.organization}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">LinkedIn URL</label>
              <input
                name="linkedinUrl"
                type="url"
                className="form-control register-input"
                placeholder="https://linkedin.com/in/yourprofile"
                value={form.linkedinUrl}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">GitHub URL</label>
              <input
                name="githubUrl"
                type="url"
                className="form-control register-input"
                placeholder="https://github.com/yourusername"
                value={form.githubUrl}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Twitter/X URL</label>
              <input
                name="twitterUrl"
                type="url"
                className="form-control register-input"
                placeholder="https://twitter.com/yourhandle"
                value={form.twitterUrl}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Portfolio / Website URL</label>
              <input
                name="portfolioUrl"
                type="url"
                className="form-control register-input"
                placeholder="https://yourportfolio.com"
                value={form.portfolioUrl}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Professional Bio (min 50 chars) *</label>
              <textarea
                name="professionalBio"
                className="form-control register-input"
                placeholder="Tell us about your professional journey..."
                value={form.professionalBio}
                onChange={handleChange}
                rows="3"
                minLength="50"
                required
              ></textarea>
            </div>
          </div>

          <div className="password-requirements mt-3">
            <p className="mb-1">Password requirements:</p>
            <ul className="requirement-list">
              {getPasswordRequirementItems().map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn w-100 register-primary-btn mt-4"
            disabled={loading}
          >
            {loading ? "Submitting Application..." : "📩 Submit Application"}
          </button>

          <p className="text-center mt-3 mb-0 small-text">
            Already have an account?{" "}
            <Link to="/login" className="link-inline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default MentorRegister;