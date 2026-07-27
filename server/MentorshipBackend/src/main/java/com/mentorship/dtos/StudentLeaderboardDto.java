package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentLeaderboardDto {
    private Long studentId;
    private String name;
    private String targetDomain;
    private long sessionsCompleted;
    private long totalHoursLearned;
    private double averageRating;
}
