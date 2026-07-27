package com.mentorship.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    private Long feedbackId;
    private Long mentorId;
    private Long studentId;
    private String studentName;
    private String initials;
    private Long sessionId;
    private Integer rating;
    private String message;
    private LocalDate feedbackDate;
}
