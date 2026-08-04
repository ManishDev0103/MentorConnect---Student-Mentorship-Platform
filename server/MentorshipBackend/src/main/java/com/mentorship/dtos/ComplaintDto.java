package com.mentorship.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ComplaintDto {
    private Long complaintId;
    private String title;
    private String description;
    private String status;
    private Long reporterId;
    private String reporterName;
    private Long targetUserId;
    private String targetUserName;
    private String response;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
