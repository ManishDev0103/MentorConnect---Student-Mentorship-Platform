import React, { createContext, useState, useCallback, useEffect } from "react";
import { decodeToken, logout as logoutService } from "./authService";

/**
 * Authentication Context
 * Provides auth state and methods to all components in the app
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const payload = decodeToken(storedToken);
        if (payload) {
          console.log("Initializing auth from stored token. Payload:", payload);
          setToken(storedToken);
          // Extract user data from JWT payload
          const userData = {
            email: payload.sub || payload.email || "Unknown", // 'sub' is typically the email in JWT
            name: payload.name || payload.fullName || (payload.sub ? payload.sub.split("@")[0] : "User"), // Fallback to name or split email
            userId: payload.userId,
            authorities: payload.authorities || [],
            ...payload // Include all other JWT claims
          };
          console.log("User data extracted:", userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Invalid token
          localStorage.removeItem("token");
        }
      }
    } catch (err) {
      console.error("AuthContext init error:", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // Set user after successful login
  const setAuthToken = useCallback((jwtToken) => {
    if (jwtToken) {
      const payload = decodeToken(jwtToken);
      if (payload) {
        console.log("Setting auth token. Full JWT Payload:", JSON.stringify(payload, null, 2));
        console.log("Payload keys:", Object.keys(payload));
        console.log("payload.sub:", payload.sub);
        console.log("payload.email:", payload.email);
        console.log("payload.name:", payload.name);
        console.log("payload.authorities:", payload.authorities);
        console.log("payload.userId:", payload.userId);
        
        setToken(jwtToken);
        // Extract user data from JWT payload
        const userData = {
          email: payload.sub || payload.email || "Unknown", // 'sub' is typically the email in JWT
          name: payload.name || payload.fullName || (payload.sub ? payload.sub.split("@")[0] : "User"), // Fallback to name or split email
          userId: payload.userId,
          authorities: payload.authorities || [],
          ...payload // Include all other JWT claims
        };
        console.log("User data extracted:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("token", jwtToken);
        return true;
      }
    }
    return false;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    logoutService();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Get user role
  const getUserRole = useCallback(() => {
    if (!user?.authorities) return null;
    if (user.authorities.includes("ROLE_STUDENT")) return "STUDENT";
    if (user.authorities.includes("ROLE_MENTOR")) return "MENTOR";
    if (user.authorities.includes("ROLE_ADMIN")) return "ADMIN";
    return null;
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      if (!user?.authorities || !Array.isArray(user.authorities)) return false;
      const targetRole = role.toUpperCase();
      const targetRoleKey = `ROLE_${targetRole}`;
      return user.authorities.some(auth => {
        if (!auth) return false;
        const str = String(auth).toUpperCase();
        return str === targetRole || str === targetRoleKey;
      });
    },
    [user]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    setAuthToken,
    logout,
    getUserRole,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
