package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Integer activeStudents;
    private Integer totalSessions;
    private Double totalEarnings;
    private Double thisMonthEarnings;
    private Double averageRating;
    private Integer completedSessions;
    private Integer upcomingSessions;
}
