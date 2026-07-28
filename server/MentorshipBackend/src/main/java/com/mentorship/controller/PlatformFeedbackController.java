package com.mentorship.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.FeedbackDTO;
import com.mentorship.service.PlatformFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/platform/feedback")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlatformFeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(PlatformFeedbackController.class);
    private final PlatformFeedbackService platformFeedbackService;

    @GetMapping("/recent")
    public ResponseEntity<ApiResponseDTO<List<FeedbackDTO>>> getRecentPlatformFeedback(
            @RequestParam(defaultValue = "5") Integer limit) {
        logger.info("GET /api/platform/feedback/recent?limit={}", limit);
        try {
            List<FeedbackDTO> feedback = platformFeedbackService.getRecentPlatformFeedback(limit);
            return ResponseEntity.ok(ApiResponseDTO.success(feedback));
        } catch (Exception e) {
            logger.error("Error fetching recent platform feedback: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
