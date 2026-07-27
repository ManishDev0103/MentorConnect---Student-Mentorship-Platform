package com.mentorship.dtos;

import java.time.LocalDate;
import lombok.Data;

@Data
public class FeedbackResponseDTO {

    private Long feedbackId;
    private Long mentorId;
    private Long studentId;
    private Long sessionId;
    private Integer rating;
    private String message;
    private LocalDate feedbackDate;
}
