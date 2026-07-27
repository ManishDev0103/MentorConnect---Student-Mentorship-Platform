package com.mentorship.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.FeedbackDTO;
import com.mentorship.service.FeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/feedback")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);
    private final FeedbackService feedbackService;

    /**
     * Get all feedback for a mentor
     */
    @GetMapping("/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<FeedbackDTO>>> getAllFeedback(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/feedback/{} - Fetching all feedback", mentorId);
        try {
            List<FeedbackDTO> feedback = feedbackService.getAllFeedback(mentorId);
            logger.info("Found {} feedback entries for mentorId: {}", feedback.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(feedback));
        } catch (Exception e) {
            logger.error("Error fetching feedback for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get recent feedback
     */
    @GetMapping("/{mentorId}/recent")
    public ResponseEntity<ApiResponseDTO<List<FeedbackDTO>>> getRecentFeedback(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<FeedbackDTO> feedback = feedbackService.getRecentFeedback(mentorId, limit);
            return ResponseEntity.ok(ApiResponseDTO.success(feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get average rating
     */
    @GetMapping("/{mentorId}/average-rating")
    public ResponseEntity<ApiResponseDTO<Double>> getAverageRating(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/feedback/{}/average-rating - Fetching average rating", mentorId);
        try {
            Double rating = feedbackService.getAverageRating(mentorId);
            logger.info("Average rating for mentorId {}: {}", mentorId, rating);
            return ResponseEntity.ok(ApiResponseDTO.success(rating));
        } catch (Exception e) {
            logger.error("Error fetching average rating for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get feedback by rating
     */
    @GetMapping("/{mentorId}/rating/{rating}")
    public ResponseEntity<ApiResponseDTO<List<FeedbackDTO>>> getFeedbackByRating(
            @PathVariable Long mentorId,
            @PathVariable Integer rating) {
        try {
            List<FeedbackDTO> feedback = feedbackService.getFeedbackByRating(mentorId, rating);
            return ResponseEntity.ok(ApiResponseDTO.success(feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get rating distribution
     */
    @GetMapping("/{mentorId}/distribution")
    public ResponseEntity<ApiResponseDTO<Object>> getRatingDistribution(@PathVariable Long mentorId) {
        try {
            Object distribution = feedbackService.getRatingDistribution(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(distribution));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get feedback count
     */
    @GetMapping("/{mentorId}/count")
    public ResponseEntity<ApiResponseDTO<Integer>> getFeedbackCount(@PathVariable Long mentorId) {
        try {
            Integer count = feedbackService.getFeedbackCount(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
