import api from "./api";

// Get student dashboard stats
export const getStudentDashboard = (studentId) => {
  return api.get(`student/${studentId}/dashboard`);
};

// Get all sessions for a student
export const getStudentSessions = (studentId) => {
  return api.get(`student/${studentId}/sessions`);
};

// Get student details
export const getStudentDetails = (studentId) => {
  return api.get(`student/${studentId}`);
};

// Get student details by user ID
export const getStudentDetailsByUserId = (userId) => {
  return api.get(`student/user/${userId}`);
};

// Book a session
export const bookSession = (studentId, sessionData) => {
  return api.post(`student/${studentId}/sessions`, sessionData);
};

// Cancel a session
export const cancelSession = (sessionId) => {
  return api.patch(`student/sessions/${sessionId}/cancel`);
};

// Delete a session
export const deleteSession = (sessionId) => {
  return api.delete(`student/sessions/${sessionId}`);
};

// Get active subscription for a student
export const getActiveSubscription = (studentId) => {
  return api.get(`student/${studentId}/subscription/active`);
};

// Get verified mentors
export const getVerifiedMentors = async (studentId, domain = null) => {
  const params = domain ? { studentId, domain } : { studentId };

  try {
    return await api.get(`student/mentors`, { params });
  } catch (error) {
    const numericStudentId = Number(studentId);

    if (!Number.isFinite(numericStudentId)) {
      throw error;
    }

    try {
      const profileResponse = await getStudentDetailsByUserId(numericStudentId);
      const resolvedStudentId =
        profileResponse?.data?.studentId ??
        profileResponse?.data?.id ??
        profileResponse?.data?.student?.studentId;

      if (!resolvedStudentId || resolvedStudentId === studentId) {
        throw error;
      }

      const retryParams = domain
        ? { studentId: resolvedStudentId, domain }
        : { studentId: resolvedStudentId };

      return await api.get(`student/mentors`, { params: retryParams });
    } catch (retryError) {
      throw retryError;
    }
  }
};

// Get mentor details by ID
export const getMentorDetails = (mentorId) => {
  return api.get(`student/mentor/${mentorId}`);
};

// Submit feedback
export const submitFeedback = (studentId, feedbackData) => {
  return api.post(`student/${studentId}/feedback`, feedbackData);
};

// Get student feedbacks
export const getStudentFeedbacks = (studentId) => {
  return api.get(`student/${studentId}/feedback`);
};

// Get first assigned mentor from sessions
export const getAssignedMentor = (studentId) => {
  return getStudentSessions(studentId).then((response) => {
    const sessions = response.data || [];
    if (sessions.length > 0) {
      // Get the first mentor from sessions
      return {
        mentorId: sessions[0].mentorId,
        name: sessions[0].mentorName,
      };
    }
    return null;
  });
};

// Update student profile
export const updateStudentProfile = (studentId, profileData) => {
  return api.put(`student/${studentId}`, profileData);
};



// Study Timer functions
// Study Timer functions
export const startStudySession = (studentId, taskName) => {
  // Backend expects RequestParam, not body
  return api.post(`student/${studentId}/study/start?taskName=${encodeURIComponent(taskName)}`);
};

export const stopStudySession = (sessionId) => {
  // Backend: /study/stop/{sessionId}
  return api.post(`student/study/stop/${sessionId}`);
};

export const getStudyHistory = (studentId) => {
  // Backend: /{studentId}/study/history
  return api.get(`student/${studentId}/study/history`);
};

export const deleteStudySession = (sessionId) => {
  // Backend: /study/{sessionId}
  return api.delete(`student/study/${sessionId}`);
};

// Chat functions for students
export const sendMessageToMentor = (messageData) => {
<<<<<<< HEAD
  return api.post('/api/messages/send', messageData);
};

export const getConversationWithMentor = (studentId, mentorId) => {
  return api.get(`/api/messages/student/${studentId}/mentor/${mentorId}`);
};

export const markMessagesAsReadByStudent = (studentId, mentorId) => {
  return api.put(`/api/messages/student/${studentId}/mentor/${mentorId}/mark-read`);
};

export const getStudentConversations = (studentId) => {
  return api.get(`/api/messages/student/${studentId}/conversations`);
=======
  return api.post('messages/send', messageData);
};

export const getConversationWithMentor = async (studentId, mentorId) => {
  return api.get(`messages/student/${studentId}/mentor/${mentorId}`);
};

export const markMessagesAsReadByStudent = async (studentId, mentorId) => {
  return api.put(`messages/student/${studentId}/mentor/${mentorId}/mark-read`);
};

export const getStudentConversations = (studentId) => {
  return api.get(`messages/student/${studentId}/conversations`);
>>>>>>> 61a8900 (ChatFeatureWorking)
};

// Subscription function

