package com.mentorship.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.FeedbackDTO;
import com.mentorship.entities.Feedback;
import com.mentorship.repository.FeedbackRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Override
    public List<FeedbackDTO> getAllFeedback(Long mentorId) {
        List<Feedback> feedbacks = feedbackRepository.findByMentor_MentorIdOrderByFeedbackDateDesc(mentorId);
        return feedbacks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getRecentFeedback(Long mentorId, Integer limit) {
        List<Feedback> feedbacks = feedbackRepository.findRecentFeedback(mentorId, limit);
        return feedbacks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRating(Long mentorId) {
        Double rating = feedbackRepository.calculateAverageRating(mentorId);
        return rating != null ? Math.round(rating * 10.0) / 10.0 : 0.0;
    }

    @Override
    public List<FeedbackDTO> getFeedbackByRating(Long mentorId, Integer rating) {
        List<Feedback> feedbacks = feedbackRepository.findByMentor_MentorIdAndRating(mentorId, rating);
        return feedbacks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Object getRatingDistribution(Long mentorId) {
        List<Object[]> distribution = feedbackRepository.getRatingDistribution(mentorId);
        Map<Integer, Long> ratingMap = new HashMap<>();
        
        // Initialize all ratings to 0
        for (int i = 1; i <= 5; i++) {
            ratingMap.put(i, 0L);
        }
        
        // Fill in actual counts
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingMap.put(rating, count);
        }
        
        return ratingMap;
    }

    @Override
    public Integer getFeedbackCount(Long mentorId) {
        return feedbackRepository.countFeedbackByMentor(mentorId);
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        String firstName = feedback.getStudent().getUserDetails().getFirstName();
        String lastName = feedback.getStudent().getUserDetails().getLastName();
        
        // Handle null or empty names
        if (firstName == null || firstName.isEmpty()) {
            firstName = "Unknown";
        }
        if (lastName == null || lastName.isEmpty()) {
            lastName = "User";
        }
        
        String fullName = firstName + " " + lastName;
        String initials = (firstName.substring(0, 1) + lastName.substring(0, 1)).toUpperCase();

        return FeedbackDTO.builder()
                .feedbackId(feedback.getFeedbackId())
                .mentorId(feedback.getMentor().getMentorId())
                .studentId(feedback.getStudent().getStudentId())
                .studentName(fullName)
                .initials(initials)
                .sessionId(feedback.getSession() != null ? feedback.getSession().getSessionId() : null)
                .rating(feedback.getRating())
                .message(feedback.getMessage())
                .feedbackDate(feedback.getFeedbackDate())
                .build();
    }
}
