import React, { useState } from "react";
import "./Registration.css";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../../API/authService";
import { showSuccess, showError } from "../../utils/toast";
import {
  getPasswordStrength,
  passwordMeetsPolicy,
  getPasswordRequirementItems,
  getPasswordStrengthColor,
} from "../../utils/passwordUtils";

const StudentRegister = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    phoneNo: "",
    targetDomain: "",
    qualification: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      // Validate required fields
      if (!form.firstName || !form.email || !form.password || !form.confirmPassword || !form.targetDomain) {
        setError("Please fill in all required fields");
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

      // Validate passwords match
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
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
        targetDomain: form.targetDomain || "",
        qualification: form.qualification || "",
      };

      await registerStudent(signupData);
      showSuccess("Student account created successfully! Please log in.");
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

  const domains = [
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

  return (
    <div className="register-page d-flex align-items-center justify-content-center">
      <div className="register-card">
        <div className="register-icon-wrapper">
          <div className="register-icon register-icon-student">🎯</div>
        </div>

        <h1 className="register-title text-center">Create Student Account</h1>
        <p className="register-subtitle text-center">
          Join Mentorship Personalized and start your learning journey
        </p>

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

          {/* Academic Information */}
          <h5 className="section-title">Academic Information</h5>

          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label">Target Domain *</label>
              <select
                name="targetDomain"
                className="form-select register-input"
                value={form.targetDomain}
                onChange={handleChange}
                required
              >
                <option value="">Select your target domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Qualification</label>
              <input
                name="qualification"
                type="text"
                className="form-control register-input"
                placeholder="e.g., B.Tech, BCA, MBA"
                value={form.qualification}
                onChange={handleChange}
              />
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
            {loading ? "Creating Account..." : "👤 Create Account"}
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

export default StudentRegister;
