package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCardDTO {
    private Long studentId;
    private String name;
    private String initials;
    private Integer sessions;
    private Integer progress;
    private String nextSession;
    private String email;
    private String targetDomain;
    private String collegeUniversity;
    private boolean resumeAvailable;
    private Long mentorId;
    private String status;
}
