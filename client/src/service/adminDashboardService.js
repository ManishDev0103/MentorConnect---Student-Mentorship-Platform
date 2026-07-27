// src/service/adminDashboardService.js
import api from "../API/api";

const ADMIN_DASHBOARD_API = "/api/admin/dashboard";

export const adminDashboardService = {
  // Overview
  getOverviewStats: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/overview`);
      return response.data;
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/recent-activity`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/users/filter`, {
        params: { role },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/users/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(
        `${ADMIN_DASHBOARD_API}/users/${userId}/status`,
        null,
        { params: { status } },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`${ADMIN_DASHBOARD_API}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Verification
  getPendingVerifications: async () => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/verifications/pending`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      throw error;
    }
  },

  approveMentor: async (mentorId) => {
    try {
      const response = await api.post(
        `${ADMIN_DASHBOARD_API}/verifications/${mentorId}/approve`,
      );
      return response.data;
    } catch (error) {
      console.error("Error approving mentor:", error);
      throw error;
    }
  },

  rejectMentor: async (mentorId) => {
    try {
      const response = await api.post(
        `${ADMIN_DASHBOARD_API}/verifications/${mentorId}/reject`,
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting mentor:", error);
      throw error;
    }
  },

  // Revenue
  getRevenueStats: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/revenue/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      throw error;
    }
  },

  getMonthlyRevenue: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/revenue/monthly`);
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      throw error;
    }
  },

  // Retention & Churn
  getRetentionChurnMetrics: async () => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/retention-churn/metrics`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching retention churn metrics:", error);
      throw error;
    }
  },

  getChurnReasons: async () => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/retention-churn/reasons`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching churn reasons:", error);
      throw error;
    }
  },

  // Leaderboards
  getTopMentors: async (limit = 5) => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/leaderboards/mentors`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching top mentors:", error);
      throw error;
    }
  },

  getTopStudents: async (limit = 5) => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/leaderboards/students`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching top students:", error);
      throw error;
    }
  },

  getLongestActivityStreaks: async (limit = 4) => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/leaderboards/activity-streak`,
        { params: { limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching activity streaks:", error);
      throw error;
    }
  },

  // Platform Growth
  getPlatformGrowthData: async () => {
    try {
      const response = await api.get(`${ADMIN_DASHBOARD_API}/growth/platform`);
      return response.data;
    } catch (error) {
      console.error("Error fetching platform growth data:", error);
      throw error;
    }
  },

  // Cohort Analysis
  getCohortRetentionAnalysis: async () => {
    try {
      const response = await api.get(
        `${ADMIN_DASHBOARD_API}/cohorts/retention`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cohort retention analysis:", error);
      throw error;
    }
  },
};
