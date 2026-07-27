package com.mentorship.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQQuestionDTO {
    private Long questionId;
    private Long mentorId;
    private Long studentId;
    private String studentName;
    private Long sessionId;
    private String topic;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String explanation;
    private String difficultyLevel;
    private Integer totalAttempts;
    private Integer correctAttempts;
}
