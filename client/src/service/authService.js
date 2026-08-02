// Auth Service for handling JWT and student ID extraction
import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Get student ID from localStorage (from JWT token)
export const getStudentId = () => {
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");

  if (!studentId && token) {
    // Try to decode JWT if studentId not stored
    try {
      const decoded = parseJwt(token);
      if (decoded?.userId && !decoded?.studentId) {
        console.warn(
          "Decoded JWT contains userId but not studentId. This may cause student API request issues.",
          decoded,
        );
      }
      return decoded?.studentId || decoded?.userId || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  return studentId ? parseInt(studentId) : null;
};

// Get mentor ID from localStorage (from JWT token)
export const getMentorId = () => {
  const token = localStorage.getItem("token");
  const mentorId = localStorage.getItem("mentorId");

  if (!mentorId && token) {
    // Try to decode JWT if mentorId not stored
    try {
      const decoded = parseJwt(token);
      return decoded?.mentorId || decoded?.userId || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  return mentorId ? parseInt(mentorId) : null;
};

// Parse JWT token
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

// Get Authorization header
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
};

// Set student ID and token in localStorage
export const setStudentAuth = (studentId, token) => {
  if (studentId) {
    localStorage.setItem("studentId", studentId.toString());
  }
  if (token) {
    localStorage.setItem("token", token);
  }
};

// Clear student auth data
export const clearStudentAuth = () => {
  localStorage.removeItem("studentId");
  localStorage.removeItem("token");
};

// Check if student is authenticated
export const isStudentAuthenticated = () => {
  return !!getStudentId() || !!localStorage.getItem("token");
};
