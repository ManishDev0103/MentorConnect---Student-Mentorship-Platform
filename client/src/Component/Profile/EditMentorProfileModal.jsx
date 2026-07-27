import React, { useState, useEffect } from "react";
import "../Modal.css";
import { updateMentorProfile, getMyMentorProfile } from "../../service/mentorService";

const EditMentorProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    highestEducation: "",
    currentPosition: "",
    organization: "",
    professionalBio: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMentorProfile();
    }
  }, [isOpen]);

  const fetchMentorProfile = async () => {
    try {
      const response = await getMyMentorProfile();
      const mentor = response.data;
      setFormData({
        specialization: mentor.specialization || "",
        experience: mentor.experience || "",
        highestEducation: mentor.highestEducation || "",
        currentPosition: mentor.currentPosition || "",
        organization: mentor.organization || "",
        professionalBio: mentor.professionalBio || mentor.about || "",
        linkedinUrl: mentor.linkedinUrl || "",
        portfolioUrl: mentor.portfolioUrl || "",
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
    if (formData.professionalBio && formData.professionalBio.length < 50) {
      setError("Professional bio must be at least 50 characters");
      return false;
    }
    if (formData.linkedinUrl && !formData.linkedinUrl.startsWith("http")) {
      setError("LinkedIn URL must start with http:// or https://");
      return false;
    }
    if (formData.portfolioUrl && !formData.portfolioUrl.startsWith("http")) {
      setError("Portfolio URL must start with http:// or https://");
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

      await updateMentorProfile(formData);

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        if (onProfileUpdated) {
          onProfileUpdated();
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Mentor Profile</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Web Development, Data Science"
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 5 years"
              />
            </div>

            <div className="form-group">
              <label>Highest Education</label>
              <input
                type="text"
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleInputChange}
                placeholder="e.g., M.Tech Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Current Position</label>
              <input
                type="text"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developer"
              />
            </div>

            <div className="form-group">
              <label>Organization</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="e.g., Google, Microsoft"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="form-group">
              <label>Portfolio URL</label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Professional Bio (minimum 50 characters)</label>
            <textarea
              name="professionalBio"
              value={formData.professionalBio}
              onChange={handleInputChange}
              rows="5"
              placeholder="Write a detailed professional bio..."
            />
            <small className="char-count">
              {formData.professionalBio.length} characters
            </small>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMentorProfileModal;
