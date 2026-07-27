import api from "./api";

/**
 * Authentication Service
 * Handles all login, signup, and auth-related API calls
 */

// Login endpoint - sends email and password
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/api/users/signin", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Handle 401 Unauthorized (invalid credentials)
    if (error.response?.status === 401) {
      throw {
        message: "Invalid email or password. Please check and try again.",
        status: 401,
      };
    }

    // Handle other backend errors
    const errorData = error.response?.data;
    throw errorData || {
      message: error.message || "Login failed",
    };
  }
};

// Signup endpoint for students
export const registerStudent = async (studentData) => {
  try {
    const response = await api.post("/api/users/signup/student", studentData);
    return response.data;
  } catch (error) {
    console.error("Student registration error:", error.response?.data || error);
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || error.message || "Student registration failed",
      status: error.response?.status,
      data: errorData
    };
  }
};

// Signup endpoint for mentors
export const registerMentor = async (mentorData) => {
  try {
    const response = await api.post("/api/users/signup/mentor", mentorData);
    return response.data;
  } catch (error) {
    console.error("Mentor registration error:", error.response?.data || error);
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || error.message || "Mentor registration failed",
      status: error.response?.status,
      data: errorData
    };
  }
};

// Logout function - clears stored auth data
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("studentId");
  localStorage.removeItem("mentorId");
};

// Decode JWT token to get user information
export const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Get user role from stored token
export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeToken(token);
  const authorities = payload?.authorities || [];

  if (authorities.includes("ROLE_STUDENT")) return "STUDENT";
  if (authorities.includes("ROLE_MENTOR")) return "MENTOR";
  if (authorities.includes("ROLE_ADMIN")) return "ADMIN";

  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};
