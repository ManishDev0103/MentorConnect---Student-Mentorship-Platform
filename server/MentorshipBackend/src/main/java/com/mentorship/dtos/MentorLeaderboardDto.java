package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorLeaderboardDto {
    private Long mentorId;
    private String name;
    private double rating;
    private long sessionsCompleted;
    private long studentsHelped;
    private String specialization;
}
