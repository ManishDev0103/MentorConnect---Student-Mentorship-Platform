package com.mentorship.dtos;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MCQPracticeSessionDTO {
    private Long sessionId;
    private Integer sessionNumber;
    private String sessionTitle;
    private String description;
    private Integer totalQuestions;
    private Integer completedQuestions;
    private Integer correctAnswers;
    private Boolean isCompleted;
    private Double accuracyPercentage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long studentId;
    private String studentName;
}
