package com.mentorship.dto;

import lombok.Data;

@Data
public class FeedbackRequestDTO {

    private Long mentorId;
    private Long sessionId;
    private Integer rating;   
    private String message;
}
