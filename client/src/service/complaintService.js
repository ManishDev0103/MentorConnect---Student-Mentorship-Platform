import api from "../API/api";

const COMPLAINT_API = "/complaints";

export const complaintService = {
  createComplaint: async (data) => {
    try {
      const response = await api.post(COMPLAINT_API, data);
      return response.data;
    } catch (error) {
      console.error("Error creating complaint:", error);
      throw error;
    }
  },

  getMyComplaints: async () => {
    try {
      const response = await api.get(`${COMPLAINT_API}/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my complaints:", error);
      throw error;
    }
  },

  getMentorsForTarget: async () => {
    try {
      const response = await api.get("/mentors/public");
      return response.data;
    } catch (error) {
      console.error("Error fetching mentors for complaint:", error);
      throw error;
    }
  },
};
