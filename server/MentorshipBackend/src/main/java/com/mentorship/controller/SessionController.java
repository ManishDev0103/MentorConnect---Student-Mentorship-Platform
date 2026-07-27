package com.mentorship.controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.SessionCreateDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.service.SessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/sessions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SessionController {

    private static final Logger logger = LoggerFactory.getLogger(SessionController.class);
    private final SessionService sessionService;

    /**
     * Get all sessions for a mentor
     */
    @GetMapping("/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getAllSessions(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/sessions/{} - Fetching all sessions", mentorId);
        try {
            List<SessionDTO> sessions = sessionService.getAllSessions(mentorId);
            logger.info("Found {} sessions for mentorId: {}", sessions.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            logger.error("Error fetching sessions for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get session by ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseDTO<SessionDTO>> getSessionById(@PathVariable Long sessionId) {
        try {
            SessionDTO session = sessionService.getSessionById(sessionId);
            return ResponseEntity.ok(ApiResponseDTO.success(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get today's sessions
     */
    @GetMapping("/{mentorId}/today")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getTodaysSessions(@PathVariable Long mentorId) {
        try {
            List<SessionDTO> sessions = sessionService.getTodaysSessions(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get upcoming sessions
     */
    @GetMapping("/{mentorId}/upcoming")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getUpcomingSessions(@PathVariable Long mentorId) {
        try {
            List<SessionDTO> sessions = sessionService.getUpcomingSessions(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get sessions for a specific date
     */
    @GetMapping("/{mentorId}/date/{date}")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getSessionsForDate(
            @PathVariable Long mentorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<SessionDTO> sessions = sessionService.getSessionsForDate(mentorId, date);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get sessions between dates
     */
    @GetMapping("/{mentorId}/range")
    public ResponseEntity<ApiResponseDTO<List<SessionDTO>>> getSessionsBetweenDates(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<SessionDTO> sessions = sessionService.getSessionsBetweenDates(mentorId, startDate, endDate);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Create a new session
     */
    @PostMapping("/{mentorId}")
    public ResponseEntity<ApiResponseDTO<SessionDTO>> createSession(
            @PathVariable Long mentorId,
            @RequestBody SessionCreateDTO sessionDTO) {
        logger.info("POST /api/mentor/sessions/{} - Creating session for student: {}", mentorId, sessionDTO.getStudentId());
        try {
            SessionDTO session = sessionService.createSession(mentorId, sessionDTO);
            logger.info("Session created successfully with id: {} for mentorId: {}", session.getSessionId(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success("Session created successfully", session));
        } catch (Exception e) {
            logger.error("Error creating session for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Update a session
     */
    @PutMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseDTO<SessionDTO>> updateSession(
            @PathVariable Long sessionId,
            @RequestBody SessionDTO sessionDTO) {
        try {
            SessionDTO session = sessionService.updateSession(sessionId, sessionDTO);
            return ResponseEntity.ok(ApiResponseDTO.success("Session updated successfully", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Cancel a session
     */
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseDTO<Void>> cancelSession(@PathVariable Long sessionId) {
        try {
            sessionService.cancelSession(sessionId);
            return ResponseEntity.ok(ApiResponseDTO.success("Session cancelled successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Complete a session
     */
    @PutMapping("/session/{sessionId}/complete")
    public ResponseEntity<ApiResponseDTO<Void>> completeSession(
            @PathVariable Long sessionId,
            @RequestParam(required = false) String notes) {
        try {
            sessionService.completeSession(sessionId, notes);
            return ResponseEntity.ok(ApiResponseDTO.success("Session marked as completed", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Reschedule a session
     */
    @PutMapping("/session/{sessionId}/reschedule")
    public ResponseEntity<ApiResponseDTO<SessionDTO>> rescheduleSession(
            @PathVariable Long sessionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate,
            @RequestParam String newTime) {
        try {
            SessionDTO session = sessionService.rescheduleSession(sessionId, newDate, newTime);
            return ResponseEntity.ok(ApiResponseDTO.success("Session rescheduled successfully", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
