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
public class VideoLectureDTO {
    private Long id;
    private String title;
    private String description;
    private Long mentorId;
    private String mentorName;
    private String subject;
    private String videoUrl;
    private String thumbnailUrl;
    private String duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime uploadDate;
}
