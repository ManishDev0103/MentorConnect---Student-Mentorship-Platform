package com.mentorship.controller;

import com.mentorship.dtos.*;
import com.mentorship.service.MCQService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentor/mcq")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MCQController {
    
    private static final Logger logger = LoggerFactory.getLogger(MCQController.class);
    private final MCQService mcqService;
    
    /**
     * Create a new MCQ question for a student
     */
    @PostMapping("/{mentorId}/questions")
    public ResponseEntity<ApiResponseDTO<MCQQuestionDTO>> createMCQQuestion(
            @PathVariable Long mentorId,
            @RequestBody CreateMCQQuestionDTO createDTO) {
        logger.info("POST /api/mentor/mcq/{}/questions - Creating new MCQ question", mentorId);
        try {
            MCQQuestionDTO question = mcqService.createMCQQuestion(mentorId, createDTO);
            logger.info("MCQ question created successfully with id: {}", question.getQuestionId());
            return ResponseEntity.ok(ApiResponseDTO.success(question));
        } catch (Exception e) {
            logger.error("Error creating MCQ question: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get all MCQ questions created by mentor
     */
    @GetMapping("/{mentorId}/questions")
    public ResponseEntity<ApiResponseDTO<List<MCQQuestionDTO>>> getMCQQuestions(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/mcq/{}/questions - Fetching all MCQ questions", mentorId);
        try {
            List<MCQQuestionDTO> questions = mcqService.getMCQQuestionsByMentor(mentorId);
            logger.info("Found {} MCQ questions for mentor {}", questions.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(questions));
        } catch (Exception e) {
            logger.error("Error fetching MCQ questions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get MCQ questions for a specific student
     */
    @GetMapping("/{mentorId}/students/{studentId}/questions")
    public ResponseEntity<ApiResponseDTO<List<MCQQuestionDTO>>> getMCQQuestionsForStudent(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        logger.info("GET /api/mentor/mcq/{}/students/{}/questions - Fetching MCQ questions", mentorId, studentId);
        try {
            List<MCQQuestionDTO> questions = mcqService.getMCQQuestionsForStudent(mentorId, studentId);
            logger.info("Found {} MCQ questions for student {}", questions.size(), studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(questions));
        } catch (Exception e) {
            logger.error("Error fetching MCQ questions for student: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get MCQ question by ID
     */
    @GetMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponseDTO<MCQQuestionDTO>> getMCQQuestion(@PathVariable Long questionId) {
        logger.info("GET /api/mentor/mcq/questions/{} - Fetching MCQ question", questionId);
        try {
            MCQQuestionDTO question = mcqService.getMCQQuestionById(questionId);
            return ResponseEntity.ok(ApiResponseDTO.success(question));
        } catch (Exception e) {
            logger.error("Error fetching MCQ question: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Update MCQ question
     */
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponseDTO<MCQQuestionDTO>> updateMCQQuestion(
            @PathVariable Long questionId,
            @RequestBody CreateMCQQuestionDTO updateDTO) {
        logger.info("PUT /api/mentor/mcq/questions/{} - Updating MCQ question", questionId);
        try {
            MCQQuestionDTO question = mcqService.updateMCQQuestion(questionId, updateDTO);
            logger.info("MCQ question {} updated successfully", questionId);
            return ResponseEntity.ok(ApiResponseDTO.success(question));
        } catch (Exception e) {
            logger.error("Error updating MCQ question: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Delete MCQ question
     */
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponseDTO<String>> deleteMCQQuestion(@PathVariable Long questionId) {
        logger.info("DELETE /api/mentor/mcq/questions/{} - Deleting MCQ question", questionId);
        try {
            mcqService.deleteMCQQuestion(questionId);
            logger.info("MCQ question {} deleted successfully", questionId);
            return ResponseEntity.ok(ApiResponseDTO.success("Question deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting MCQ question: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get student MCQ statistics
     */
    @GetMapping("/{mentorId}/students/{studentId}/stats")
    public ResponseEntity<ApiResponseDTO<StudentMCQStatsDTO>> getStudentMCQStats(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        logger.info("GET /api/mentor/mcq/{}/students/{}/stats - Fetching MCQ stats", mentorId, studentId);
        try {
            StudentMCQStatsDTO stats = mcqService.getStudentMCQStats(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(stats));
        } catch (Exception e) {
            logger.error("Error fetching MCQ stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get all attempts for a student
     */
    @GetMapping("/{mentorId}/students/{studentId}/attempts")
    public ResponseEntity<ApiResponseDTO<List<MCQAttemptDTO>>> getStudentAttempts(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        logger.info("GET /api/mentor/mcq/{}/students/{}/attempts - Fetching student attempts", mentorId, studentId);
        try {
            List<MCQAttemptDTO> attempts = mcqService.getStudentAttempts(mentorId, studentId);
            logger.info("Found {} attempts for student {}", attempts.size(), studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(attempts));
        } catch (Exception e) {
            logger.error("Error fetching student attempts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
    
    /**
     * Get attempts for a specific question
     */
    @GetMapping("/questions/{questionId}/attempts")
    public ResponseEntity<ApiResponseDTO<List<MCQAttemptDTO>>> getQuestionAttempts(@PathVariable Long questionId) {
        logger.info("GET /api/mentor/mcq/questions/{}/attempts - Fetching question attempts", questionId);
        try {
            List<MCQAttemptDTO> attempts = mcqService.getQuestionAttempts(questionId);
            logger.info("Found {} attempts for question {}", attempts.size(), questionId);
            return ResponseEntity.ok(ApiResponseDTO.success(attempts));
        } catch (Exception e) {
            logger.error("Error fetching question attempts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
