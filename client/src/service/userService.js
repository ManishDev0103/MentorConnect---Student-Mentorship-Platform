import api from "../API/api";

// Upload profile image
export const uploadProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return api.post(`/users/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get user's own profile image
export const getMyProfileImage = () => {
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  return api.get(`/users/image/me?t=${timestamp}`, {
    responseType: 'blob'
  });
};

// Get profile image by user ID
export const getProfileImageByUserId = (userId) => {
  const timestamp = new Date().getTime();
  return api.get(`/users/image/${userId}?t=${timestamp}`, {
    responseType: 'blob'
  });
};
// Get user's own profile details
export const getMyProfileDetails = () => {
  return api.get(`/users/me`);
};

export const updateEmailPreferences = (enabled) => {
  return api.patch(`/users/email-preferences`, {
    emailNotificationsEnabled: enabled,
  });
};

export const deleteAccount = () => {
  return api.delete(`/users/me`);
};
