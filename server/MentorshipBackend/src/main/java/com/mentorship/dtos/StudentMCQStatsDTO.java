package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMCQStatsDTO {
    private Long studentId;
    private String studentName;
    private Integer totalQuestions;
    private Integer totalAttempts;
    private Integer correctAttempts;
    private Double accuracyPercentage;
    private Integer questionsAttempted;
    private Integer questionsRemaining;
}
