package com.mentorship.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.CreateMCQSessionDTO;
import com.mentorship.dtos.MCQPracticeSessionDTO;
import com.mentorship.service.MCQPracticeSessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/mcq-sessions")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MCQPracticeSessionController {
    
    private final MCQPracticeSessionService sessionService;
    
    @PostMapping("/{mentorId}")
    public ResponseEntity<ApiResponseDTO<MCQPracticeSessionDTO>> createSession(
            @PathVariable Long mentorId,
            @RequestBody CreateMCQSessionDTO createDTO) {
        try {
            MCQPracticeSessionDTO session = sessionService.createSession(mentorId, createDTO);
            return ResponseEntity.ok(ApiResponseDTO.success(session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{mentorId}/students/{studentId}")
    public ResponseEntity<ApiResponseDTO<List<MCQPracticeSessionDTO>>> getSessionsByMentorAndStudent(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        try {
            List<MCQPracticeSessionDTO> sessions = sessionService.getSessionsByMentorAndStudent(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    @GetMapping("/students/{studentId}")
    public ResponseEntity<ApiResponseDTO<List<MCQPracticeSessionDTO>>> getSessionsByStudent(
            @PathVariable Long studentId) {
        try {
            List<MCQPracticeSessionDTO> sessions = sessionService.getSessionsByStudent(studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(sessions));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseDTO<MCQPracticeSessionDTO>> getSessionById(
            @PathVariable Long sessionId) {
        try {
            MCQPracticeSessionDTO session = sessionService.getSessionById(sessionId);
            return ResponseEntity.ok(ApiResponseDTO.success(session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseDTO<String>> deleteSession(@PathVariable Long sessionId) {
        try {
            sessionService.deleteSession(sessionId);
            return ResponseEntity.ok(ApiResponseDTO.success("Session deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    @PostMapping("/session/{sessionId}/update-progress")
    public ResponseEntity<ApiResponseDTO<MCQPracticeSessionDTO>> updateSessionProgress(
            @PathVariable Long sessionId) {
        try {
            MCQPracticeSessionDTO session = sessionService.updateSessionProgress(sessionId);
            return ResponseEntity.ok(ApiResponseDTO.success(session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
