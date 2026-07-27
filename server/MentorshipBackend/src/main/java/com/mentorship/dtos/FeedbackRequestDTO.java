package com.mentorship.dtos;

import lombok.Data;

@Data
public class FeedbackRequestDTO {

    private Long mentorId;
    private Long sessionId;
    private Integer rating;   
    private String message;
}
