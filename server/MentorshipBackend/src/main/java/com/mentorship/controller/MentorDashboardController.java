package com.mentorship.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.DashboardStatsDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.dtos.StudentCardDTO;
import com.mentorship.service.MentorDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MentorDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(MentorDashboardController.class);
    private final MentorDashboardService dashboardService;

    /**
     * Get dashboard statistics for a mentor
     */
    @GetMapping("/{mentorId}/stats")
    public ResponseEntity<ApiResponseDTO<DashboardStatsDTO>> getDashboardStats(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/dashboard/{}/stats - Fetching dashboard stats", mentorId);
        try {
            DashboardStatsDTO stats = dashboardService.getDashboardStats(mentorId);
            logger.info("Dashboard stats fetched successfully for mentorId: {}", mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(stats));
        } catch (Exception e) {
            logger.error("Error fetching dashboard stats for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get today's sessions for a mentor
     */
    @GetMapping("/{mentorId}/today-sessions")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getTodaysSessions(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/dashboard/{}/today-sessions - Fetching today's sessions", mentorId);
        try {
            List<SessionDTO> sessions = dashboardService.getTodaysSessions(mentorId);
            logger.info("Found {} sessions for today for mentorId: {}", sessions.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            logger.error("Error fetching today's sessions for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get assigned students summary for a mentor
     */
    @GetMapping("/{mentorId}/students-summary")
    public ResponseEntity<ApiResponseDTO<List<StudentCardDTO>>> getAssignedStudentsSummary(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/dashboard/{}/students-summary - Fetching students summary", mentorId);
        try {
            List<StudentCardDTO> students = dashboardService.getAssignedStudentsSummary(mentorId);
            logger.info("Found {} assigned students for mentorId: {}", students.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(students));
        } catch (Exception e) {
            logger.error("Error fetching students summary for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
