import React, { useState } from "react";
import "./Registration.css";
import { Link, useNavigate } from "react-router-dom";
import { registerMentor } from "../../API/authService";

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      // Validate required fields
      if (!form.firstName || !form.email || !form.password || !form.specialization || !form.experience || !form.ratePerSession || !form.highestEducation || !form.currentPosition || !form.organization || !form.professionalBio) {
        setError("Please fill in all required fields");
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
      };

      await registerMentor(signupData);

      alert("Mentor application submitted successfully! Your account is pending admin verification.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
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
              <label className="form-label">Phone Number</label>
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
              <input
                name="password"
                type="password"
                className="form-control register-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Confirm Password *</label>
              <input
                name="confirmPassword"
                type="password"
                className="form-control register-input"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
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