package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageDTO {
    private Long mentorId;
    private Long studentId;
    private String content;
    private String senderType; // "MENTOR" or "STUDENT"
}
