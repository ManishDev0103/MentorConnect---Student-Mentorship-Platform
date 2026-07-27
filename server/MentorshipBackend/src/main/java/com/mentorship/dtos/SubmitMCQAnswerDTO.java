package com.mentorship.dtos;

import lombok.Data;

@Data
public class SubmitMCQAnswerDTO {
    private Long questionId;
    private Long sessionId;
    private String selectedAnswer; // A, B, C, or D
}
