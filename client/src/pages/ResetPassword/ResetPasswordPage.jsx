import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../service/authApiService";
import "./ResetPassword.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid reset link. No token found.");
    }
  }, [searchParams]);

  const validate = () => {
    setError("");

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return false;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (newPassword.length > 20) {
      setError("Password must not exceed 20 characters");
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page d-flex align-items-center justify-content-center">
        <div className="reset-password-card success-card shadow-lg">
          <div className="success-icon-large">✓</div>
          <h3>Password Reset Successful</h3>
          <p>Your password has been updated successfully.</p>
          <p className="redirect-text">Redirecting to login...</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page d-flex align-items-center justify-content-center">
      <div className="reset-password-card shadow-lg">
        <div className="reset-password-header">
          <h2>Reset Your Password</h2>
          <p className="text-muted">Enter your new password below</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control reset-password-input"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                disabled={loading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <small className="form-text text-muted d-block mt-2">
              Password must be 8-20 characters long
            </small>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control reset-password-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                disabled={loading}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 reset-password-btn"
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="reset-password-footer text-center mt-4">
          <p className="text-muted mb-0">
            Remember your password?{" "}
            <button
              type="button"
              className="reset-password-link"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
