import api from "../API/api";

// Change password (authenticated)
export const changePassword = (changePasswordData) => {
  return api.patch("/api/users/change-password", changePasswordData);
};

// Forgot password - sends email to request password reset
export const forgotPassword = (forgotPasswordData) => {
  return api.post("/api/users/forgot-password", forgotPasswordData);
};

// Reset password with token from email
export const resetPassword = (resetPasswordData) => {
  return api.patch("/api/users/reset-password", resetPasswordData);
};
