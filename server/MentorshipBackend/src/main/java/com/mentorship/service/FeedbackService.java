package com.mentorship.service;

import java.util.List;

import com.mentorship.dtos.FeedbackDTO;

public interface FeedbackService {
    
    // Get all feedback for a mentor
    List<FeedbackDTO> getAllFeedback(Long mentorId);
    
    // Get recent feedback
    List<FeedbackDTO> getRecentFeedback(Long mentorId, Integer limit);
    
    // Get average rating
    Double getAverageRating(Long mentorId);
    
    // Get feedback by rating
    List<FeedbackDTO> getFeedbackByRating(Long mentorId, Integer rating);
    
    // Get rating distribution
    Object getRatingDistribution(Long mentorId);
    
    // Get feedback count
    Integer getFeedbackCount(Long mentorId);
}
