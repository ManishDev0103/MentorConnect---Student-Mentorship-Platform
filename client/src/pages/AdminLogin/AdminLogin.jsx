import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, decodeToken } from "../../API/authService";
import { useAuth } from "../../API/AuthContext";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const onLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Please enter email and password");
        setLoading(false);
        return;
      }

      const response = await loginUser(email, password);
      const token = response.jwt;
      localStorage.setItem("token", token);

      const payload = decodeToken(token);
      const authorities = payload?.authorities || [];

      if (!authorities.find((a) => a === "ROLE_ADMIN")) {
        // Not an admin — remove token and show error
        localStorage.removeItem("token");
        setError("Account is not an admin. Please use an admin account.");
        setLoading(false);
        return;
      }

      // Valid admin
      setAuthToken(token);
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      let msg = "Invalid email or password";
      if (err?.response?.data?.message) msg = err.response.data.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") onLogin();
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Sign In</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        {error && <div className="text-danger">{error}</div>}

        <button className="btn btn-primary mt-3" onClick={onLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in as Admin"}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
