package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private Long studentId;
    private String studentName;
    private Long mentorId;
    private String mentorName;
    private String lastMessage;
    private String lastMessageTime;
    private Long unreadCount;
}
