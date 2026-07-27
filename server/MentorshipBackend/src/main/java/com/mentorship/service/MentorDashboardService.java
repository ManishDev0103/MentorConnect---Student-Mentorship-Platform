package com.mentorship.service;

import java.util.List;

import com.mentorship.dtos.DashboardStatsDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.dtos.StudentCardDTO;

public interface MentorDashboardService {
    
    // Get dashboard statistics
    DashboardStatsDTO getDashboardStats(Long mentorId);
    
    // Get today's sessions
    List<SessionDTO> getTodaysSessions(Long mentorId);
    
    // Get assigned students summary
    List<StudentCardDTO> getAssignedStudentsSummary(Long mentorId);
}
