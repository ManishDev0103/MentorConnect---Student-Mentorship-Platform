package com.mentorship.service;

import java.util.List;
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
public class PlatformFeedbackServiceImpl implements PlatformFeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Override
    public List<FeedbackDTO> getRecentPlatformFeedback(Integer limit) {
        List<Feedback> feedbacks = feedbackRepository.findRecentPlatformFeedback(limit);
        return feedbacks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        String firstName = feedback.getStudent().getUserDetails().getFirstName();
        String lastName = feedback.getStudent().getUserDetails().getLastName();

        if (firstName == null || firstName.isBlank()) {
            firstName = "Student";
        }
        if (lastName == null || lastName.isBlank()) {
            lastName = "";
        }

        String fullName = (firstName + " " + lastName).trim();
        String initials = (firstName.substring(0, 1) + (lastName.isBlank() ? "" : lastName.substring(0, 1))).toUpperCase();

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
