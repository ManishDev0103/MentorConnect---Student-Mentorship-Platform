package com.mentorship.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private Long messageId;
    private Long mentorId;
    private Long studentId;
    private String studentName;
    private String senderType;
    private String content;
    private LocalDateTime sentAt;
    private Boolean isRead;
}
