package com.mentorship.dtos;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQAttemptDTO {
    private Long attemptId;
    private Long questionId;
    private String questionText;
    private String topic;
    private Long studentId;
    private String studentName;
    private Long sessionId;
    private String selectedAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private LocalDateTime attemptedAt;
    private Integer timeTakenSeconds;
}
