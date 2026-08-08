import api from "../API/api";

// Change password (authenticated)
export const changePassword = (changePasswordData) => {
  return api.patch("/users/change-password", changePasswordData);
};

// Forgot password - sends email to request password reset
export const forgotPassword = (forgotPasswordData) => {
  return api.post("/users/forgot-password", forgotPasswordData);
};

// Reset password with token from email
export const resetPassword = (resetPasswordData) => {
  return api.patch("/users/reset-password", resetPasswordData);
};

export const validateResetToken = (token) => {
  return api.get("/users/validate-reset-token", { params: { token } });
};
