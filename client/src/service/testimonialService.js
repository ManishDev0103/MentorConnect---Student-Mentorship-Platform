import api from "../API/api";

// Get recent feedback for the homepage testimonials
export const getRecentPlatformFeedback = async (limit = 5) => {
  const response = await api.get(`/platform/feedback/recent`, {
    params: { limit },
  });
  return response;
};
