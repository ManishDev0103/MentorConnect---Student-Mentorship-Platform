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
public class StudyNoteDTO {
    private Long id;
    private String title;
    private String description;
    private Long mentorId;
    private Long sessionId;
    private String mentorName;
    private String subject;
    private String fileName;
    private String uploadedBy;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
