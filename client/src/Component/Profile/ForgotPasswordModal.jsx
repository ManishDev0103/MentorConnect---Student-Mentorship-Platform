import React, { useState } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "../../service/authApiService";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
      toast.success("Password reset link sent to your email!");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail("");
        setSubmitted(false);
        onClose();
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to process forgot password request";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <div className="forgot-password-header">
          <h5>Forgot Password</h5>
          <button 
            className="forgot-password-close"
            onClick={handleClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="forgot-password-body text-center">
            <div className="success-icon">✓</div>
            <h6>Check Your Email</h6>
            <p className="text-muted">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-muted small">
              The link will expire in 15 minutes. Please check your spam folder if you don't see it.
            </p>
          </div>
        ) : (
          <>
            <div className="forgot-password-body">
              <p className="text-muted mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control forgot-password-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary forgot-password-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </div>

            <div className="forgot-password-footer">
              <p className="text-muted text-center mb-0">
                Remember your password?{" "}
                <button 
                  className="forgot-password-link"
                  onClick={handleClose}
                  type="button"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
