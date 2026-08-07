import React, { useState } from "react";
import "./ChangePasswordModal.css";
import { changePassword } from "../../service/authApiService";
import { toast } from "react-toastify";
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  passwordMeetsPolicy,
} from "../../utils/passwordUtils";
import { useDarkMode } from "../../context/DarkModeContext";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { isDarkMode } = useDarkMode();

  const newPasswordStrength = getPasswordStrength(formData.newPassword);
  const confirmPasswordMatch =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  const getConfirmTextColor = () =>
    confirmPasswordMatch
      ? isDarkMode
        ? "#86efac"
        : "#16a34a"
      : isDarkMode
      ? "#fca5a5"
      : "#dc2626";

  const getConfirmBorderColor = () =>
    confirmPasswordMatch
      ? isDarkMode
        ? "#4ade80"
        : "#22c55e"
      : isDarkMode
      ? "#fca5a5"
      : "#ef4444";

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordMeetsPolicy(formData.newPassword)) {
      newErrors.newPassword = "Password must include uppercase, lowercase, number, and special character";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to change password. Please try again.";
      toast.error(errorMsg);
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Change Password</h4>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <div className="invalid-feedback">{errors.currentPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                style={{
                  borderColor:
                    formData.newPassword.length > 0
                      ? getPasswordStrengthColor(newPasswordStrength.score)
                      : undefined,
                  boxShadow:
                    formData.newPassword.length > 0
                      ? `0 0 0 0.2rem ${getPasswordStrengthColor(newPasswordStrength.score)}22`
                      : undefined,
                }}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <div className="password-strength-meter mt-2">
                <div
                  className="password-strength-track"
                  style={{
                    width: `${(newPasswordStrength.score / 5) * 100}%`,
                    background: getPasswordStrengthColor(newPasswordStrength.score),
                  }}
                />
              </div>
              <small
                className="form-text mt-2 d-block"
                style={{ color: getPasswordStrengthColor(newPasswordStrength.score) }}
              >
                {newPasswordStrength.label}
              </small>
              {errors.newPassword && (
                <div className="invalid-feedback">{errors.newPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                style={{
                  borderColor:
                    formData.confirmPassword.length > 0
                      ? confirmPasswordMatch
                        ? "#22c55e"
                        : "#ef4444"
                      : undefined,
                  boxShadow:
                    formData.confirmPassword.length > 0
                      ? `0 0 0 0.2rem ${confirmPasswordMatch ? "#22c55e" : "#ef4444"}22`
                      : undefined,
                }}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
              />
              {formData.confirmPassword.length > 0 && (
                <small
                  className="form-text mt-2 d-block"
                  style={{ color: getConfirmTextColor() }}
                >
                  {confirmPasswordMatch ? "Passwords match" : "Passwords do not match"}
                </small>
              )}
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
