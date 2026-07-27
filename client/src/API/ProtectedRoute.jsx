import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Protected Route Component
 * Restricts access to routes based on authentication and role
 */
export const ProtectedRoute = ({ element, requiredRole = null }) => {
  const { isAuthenticated, loading, hasRole, user } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    console.log(`Checking role: requiredRole="${requiredRole}", user authorities="${user?.authorities?.join(", ")}", hasRole result=${hasRole(requiredRole)}`);
    if (!hasRole(requiredRole)) {
      console.error(`User does not have required role "${requiredRole}". Available roles: ${user?.authorities?.join(", ")}`);
      return <Navigate to="/" replace />;
    }
  }

  return element;
};

/**
 * Public Route Component
 * Only redirects if user is already authenticated AND trying to access auth pages
 */
export const PublicRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If already authenticated, redirect to home/dashboard
  // But let them access public pages like /mentors, /register, etc.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
