import React, { useState, useEffect } from "react";
import "../../../Component/Modal.css";
import { updateStudentProfile, getStudentDetails } from "../../../service/studentservice";
import { getStudentId } from "../../../service/authService";
import { useDarkMode } from "../../../context/DarkModeContext";

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    targetDomain: "",
    qualification: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isDarkMode } = useDarkMode();

  // Dark mode style helpers
  const getSuccessStyle = () => ({
    background: isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#d1fae5",
    color: isDarkMode ? "#86efac" : "#065f46",
    border: isDarkMode ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid #6ee7b7"
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudentProfile();
    }
  }, [isOpen]);

  const fetchStudentProfile = async () => {
    try {
      const studentId = getStudentId();
      if (!studentId) {
        setError("Student ID not found");
        return;
      }

      const response = await getStudentDetails(studentId);
      const student = response.data;
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        targetDomain: student.targetDomain || "",
        qualification: student.qualification || "",
      });
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const studentId = getStudentId();
      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        return;
      }

      await updateStudentProfile(studentId, formData);

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onProfileUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleUpdateProfile}>
            {error && (
              <div className="form-error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            {success && (
              <div
                className="form-error-message"
                style={getSuccessStyle()}
              >
                <span>✅ {success}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Target Domain</label>
              <input
                type="text"
                name="targetDomain"
                value={formData.targetDomain}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g., Web Development, Data Science"
              />
            </div>

            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g., B.Tech Computer Science"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-schedule"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
