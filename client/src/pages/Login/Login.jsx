import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, decodeToken } from "../../API/authService";
import { useAuth } from "../../API/AuthContext";
import ForgotPasswordModal from "../../Component/Profile/ForgotPasswordModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectRole, setRedirectRole] = useState(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const navigate = useNavigate();
  const { setAuthToken, isAuthenticated } = useAuth();

  // Redirect after auth context is updated
  useEffect(() => {
    if (isAuthenticated && redirectRole) {
      console.log("Redirecting based on role:", redirectRole);
      if (redirectRole === "ROLE_STUDENT") {
        navigate("/student-dashboard");
      } else if (redirectRole === "ROLE_MENTOR") {
        navigate("/mentor");
      } else if (redirectRole === "ROLE_ADMIN") {
        navigate("/admin-dashboard");
      }
      setRedirectRole(null);
    }
  }, [isAuthenticated, redirectRole, navigate]);

  const onLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate inputs
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      // Call auth service to login
      const response = await loginUser(email, password);
      const token = response.jwt;

      // Store JWT token
      localStorage.setItem("token", token);

      // Decode JWT payload to get user roles
      const payload = decodeToken(token);
      const authorities = payload?.authorities || [];

      console.log("===== JWT DECODED =====");
      console.log("Full Payload:", JSON.stringify(payload, null, 2));
      console.log("Payload keys:", Object.keys(payload));
      console.log("payload.sub:", payload?.sub);
      console.log("payload.email:", payload?.email);
      console.log("payload.name:", payload?.name);
      console.log("payload.userId:", payload?.userId);
      console.log("payload.studentId:", payload?.studentId);
      console.log("payload.authorities:", authorities);
      console.log("========================");

      // Clear any stale data from previous sessions
      localStorage.removeItem("studentId");
      localStorage.removeItem("mentorId");

      // Store studentId/mentorId if present in token
      if (payload?.studentId) {
        localStorage.setItem("studentId", payload.studentId);
      }
      if (payload?.mentorId) {
        localStorage.setItem("mentorId", payload.mentorId);
      }

      // Find the role (first ROLE_* authority, ignore other authorities like FACTOR_PASSWORD)
      const userRole = authorities.find(auth => auth.startsWith("ROLE_"));

      if (userRole) {
        // Update auth context with user data
        setAuthToken(token);
        // Set redirect role to trigger useEffect
        setRedirectRole(userRole);
      } else {
        setError("Your account does not have a valid role assigned");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Display specific error messages from backend
      let errorMessage = "Invalid email or password. Please try again.";

      // Check various error locations where backend might put the message
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.errors) {
        // Handle validation errors from backend
        errorMessage = Object.values(err.errors).join(", ");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  // Create a client-side demo JWT token for instant faculty presentation
  const createDemoToken = (role, email, name, id) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payloadObj = {
      sub: email,
      name: name,
      userId: id,
      authorities: [role],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30,
    };
    if (role === "ROLE_STUDENT") payloadObj.studentId = id;
    if (role === "ROLE_MENTOR") payloadObj.mentorId = id;

    const payload = btoa(JSON.stringify(payloadObj));
    return `${header}.${payload}.demo_signature`;
  };

  const handleDemoLogin = (role) => {
    // Student demo login is disabled to avoid pre-included student accounts
    let email;
    let name;
    let id;

    if (role === "ROLE_MENTOR") {
      email = "mentor.demo@cdac.in";
      name = "Dr. Ananya Verma";
      id = 1;
    } else if (role === "ROLE_ADMIN") {
      email = "admin.demo@cdac.in";
      name = "Admin System";
      id = 99;
    } else {
      return; // do not create demo tokens for students
    }

    const demoToken = createDemoToken(role, email, name, id);
    localStorage.setItem("token", demoToken);
    if (role === "ROLE_MENTOR") localStorage.setItem("mentorId", id.toString());

    setAuthToken(demoToken);
    setRedirectRole(role);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Back Button */}
        <Link to="/" className="back-link me-auto">
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="login-title text-center">
          Welcome to Mentorship <br /> Personalized
        </h1>

        <p className="login-subtitle text-center">
          Sign in to continue your learning journey
        </p>

        {/* Email */}
        <div className="mb-3">
          <label className="login-label">Email</label>
          <input
            type="email"
            className="form-control login-input"
            placeholder="test1@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="login-label">Password</label>
          <input
            type="password"
            className="form-control login-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        {/* Error with Forgot Password Link */}
        {error && (
          <div className="login-error-container">
            <p className="text-danger">{error}</p>
            {error.toLowerCase().includes("invalid") ||
              error.toLowerCase().includes("password") ||
              error.toLowerCase().includes("unauthorized") ? (
              <button
                type="button"
                className="forgot-password-inline-link"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Forgot Password?
              </button>
            ) : null}
          </div>
        )}

        {/* Login Button */}
        <button
          className="btn w-100 login-primary-btn mb-3"
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Quick Demo Login Section for Faculty Presentation */}
        <div className="demo-login-box mt-3 p-3 text-center border rounded bg-light">
          <p className="mb-2 text-muted fw-bold small">⚡ 1-Click Faculty Demo Login</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {/* Student demo removed to avoid pre-included demo student accounts */}
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => handleDemoLogin("ROLE_MENTOR")}
            >
              👩‍🏫 Mentor Demo
            </button>
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => handleDemoLogin("ROLE_ADMIN")}
            >
              ⚙️ Admin Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer text-center mt-4">
          <p>
            Don't have an account?
            <span className="login-link-primary">
              <a href="/register/student"> Sign up as Student</a>
            </span>{" "}
            or
          </p>
          <span className="login-link-mentor">
            <a href="/register/mentor"> Apply as Mentor</a>
          </span>
        </div>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
