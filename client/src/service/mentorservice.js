import api, { apiRoot, apiPublic } from './api';

// Dashboard APIs
export const getDashboardStats = async (mentorId) => {
  const response = await api.get(`/mentor/dashboard/${mentorId}/stats`);
  return response.data;
};

export const getTodaySessions = async (mentorId) => {
  const response = await api.get(`/mentor/sessions/${mentorId}/today`);
  return response.data;
};

export const getUpcomingSessions = async (mentorId) => {
  const response = await api.get(`/mentor/sessions/${mentorId}/upcoming`);
  return response.data;
};

// Availability APIs
export const getAvailabilityForDate = async (mentorId, date) => {
  const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const response = await api.get(`/mentor/availability/${mentorId}/date/${formattedDate}`);
  return response.data;
};

export const getAvailabilityForDateRange = async (mentorId, startDate, endDate) => {
  const formattedStart = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
  const formattedEnd = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
  const response = await api.get(`/mentor/availability/${mentorId}/range`, {
    params: { startDate: formattedStart, endDate: formattedEnd }
  });
  return response.data;
};

export const setAvailability = async (mentorId, availabilityData) => {
  const response = await api.post(`/mentor/availability/${mentorId}/set`, availabilityData);
  return response.data;
};

export const toggleSlotAvailability = async (mentorId, date, timeSlot) => {
  const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const response = await api.put(`/mentor/availability/${mentorId}/toggle`, null, {
    params: { date: formattedDate, timeSlot }
  });
  return response.data;
};

export const blockDay = async (mentorId, date) => {
  const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const response = await api.post(`/mentor/availability/${mentorId}/block-day`, null, {
    params: { date: formattedDate }
  });
  return response.data;
};

export const checkSlotAvailability = async (mentorId, date, timeSlot) => {
  const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const response = await api.get(`/mentor/availability/${mentorId}/check`, {
    params: { date: formattedDate, timeSlot }
  });
  return response.data;
};

// Students APIs
export const getMyStudents = async (mentorId) => {
  const response = await api.get(`/mentor/students/${mentorId}`);
  return response.data;
};

export const getStudentProgress = async (mentorId, studentId) => {
  const response = await api.get(`/mentor/students/${mentorId}/${studentId}/progress`);
  return response.data;
};

// Feedback APIs
export const getFeedback = async (mentorId) => {
  const response = await api.get(`/mentor/feedback/${mentorId}`);
  return response.data;
};

export const getRecentFeedback = async (mentorId, limit = 5) => {
  const response = await api.get(`/mentor/feedback/${mentorId}/recent`, {
    params: { limit }
  });
  return response.data;
};

export const getAverageRating = async (mentorId) => {
  const response = await api.get(`/mentor/feedback/${mentorId}/average-rating`);
  return response.data;
};

// Earnings APIs
export const getEarningsSummary = async (mentorId) => {
  const response = await api.get(`/mentor/earnings/${mentorId}/summary`);
  return response.data;
};

export const getMonthlyEarnings = async (mentorId) => {
  const response = await api.get(`/mentor/earnings/${mentorId}/monthly`);
  return response.data;
};

export const getTransactionHistory = async (mentorId) => {
  const response = await api.get(`/mentor/earnings/${mentorId}/transactions`);
  return response.data;
};

// Session APIs
export const getSessionById = async (sessionId) => {
  const response = await api.get(`/mentor/sessions/${sessionId}`);
  return response.data;
};

export const createSession = async (mentorId, sessionData) => {
  const response = await api.post(`/mentor/sessions/${mentorId}`, sessionData);
  return response.data;
};

export const updateSessionStatus = async (sessionId, status) => {
  const response = await api.put(`/mentor/sessions/${sessionId}/status`, null, {
    params: { status }
  });
  return response.data;
};

// MCQ APIs
export const createMCQQuestion = async (mentorId, questionData) => {
  const response = await api.post(`/mentor/mcq/${mentorId}/questions`, questionData);
  return response.data;
};

export const getMCQQuestions = async (mentorId) => {
  const response = await api.get(`/mentor/mcq/${mentorId}/questions`);
  return response.data;
};

export const getMCQQuestionsForStudent = async (mentorId, studentId) => {
  const response = await api.get(`/mentor/mcq/${mentorId}/students/${studentId}/questions`);
  return response.data;
};

export const getMCQQuestionById = async (questionId) => {
  const response = await api.get(`/mentor/mcq/questions/${questionId}`);
  return response.data;
};

export const updateMCQQuestion = async (questionId, questionData) => {
  const response = await api.put(`/mentor/mcq/questions/${questionId}`, questionData);
  return response.data;
};

export const deleteMCQQuestion = async (questionId) => {
  const response = await api.delete(`/mentor/mcq/questions/${questionId}`);
  return response.data;
};

export const getStudentMCQStats = async (mentorId, studentId) => {
  const response = await api.get(`/mentor/mcq/${mentorId}/students/${studentId}/stats`);
  return response.data;
};

export const getStudentAttempts = async (mentorId, studentId) => {
  const response = await api.get(`/mentor/mcq/${mentorId}/students/${studentId}/attempts`);
  return response.data;
};

export const getQuestionAttempts = async (questionId) => {
  const response = await api.get(`/mentor/mcq/questions/${questionId}/attempts`);
  return response.data;
};

// MCQ Practice Session APIs
export const createMCQSession = async (mentorId, sessionData) => {
  const response = await api.post(`/mentor/mcq-sessions/${mentorId}`, sessionData);
  return response.data;
};

export const getMCQSessions = async (mentorId, studentId) => {
  const response = await api.get(`/mentor/mcq-sessions/${mentorId}/students/${studentId}`);
  return response.data;
};

export const getMCQSessionById = async (sessionId) => {
  const response = await api.get(`/mentor/mcq-sessions/session/${sessionId}`);
  return response.data;
};

export const deleteMCQSession = async (sessionId) => {
  const response = await api.delete(`/mentor/mcq-sessions/session/${sessionId}`);
  return response.data;
};

export const updateSessionProgress = async (sessionId) => {
  const response = await api.post(`/mentor/mcq-sessions/session/${sessionId}/update-progress`);
  return response.data;
};

// Chat APIs
export const sendMessage = async (messageData) => {
  const response = await api.post('/messages/send', messageData);
  return response;
};

export const getConversation = async (mentorId, studentId) => {
  const response = await api.get(`/messages/mentor/${mentorId}/student/${studentId}`);
  return response;
};

export const markMessagesAsRead = async (mentorId, studentId) => {
  const response = await api.put(`/messages/mentor/${mentorId}/student/${studentId}/mark-read`);
  return response;
};

export const getMentorConversations = async (mentorId) => {
  const response = await api.get(`/messages/mentor/${mentorId}/conversations`);
  return response;
};

export const getUnreadCount = async (mentorId, studentId) => {
  const response = await api.get(`/messages/unread-count/${mentorId}/${studentId}`);
  return response;
};

// Resume Upload API
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiRoot.post(`/mentors/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Demo video upload (mentor authenticated)
export const uploadDemo = async (file, description = '') => {
  const formData = new FormData();
  formData.append('demo', file);
  if (description) formData.append('description', description);

  const response = await apiRoot.post(`/mentors/demo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Public demo download: returns blob response
export const getDemoBlob = async (mentorUserId) => {
  const response = await apiPublic.get(`/mentors/${mentorUserId}/demo`, { responseType: 'blob' });
  return response.data;
};

// Mentor Profile APIs
export const getMyMentorProfile = async () => {
  const response = await apiRoot.get(`/mentors/me`);
  return response;
};

export const updateMentorProfile = async (profileData) => {
  const response = await apiRoot.patch(`/mentors/profile`, profileData);
  return response.data;
};

// Public mentor listing (no auth required)
export const getPublicMentors = async (domain = null) => {
  const params = domain ? { domain } : {};
  const response = await apiPublic.get(`/mentors/public`, { params });
  return response;
};


