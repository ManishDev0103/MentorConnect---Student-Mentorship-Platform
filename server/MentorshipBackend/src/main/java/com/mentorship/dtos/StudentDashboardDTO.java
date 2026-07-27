package com.mentorship.dtos;

import lombok.Data;

@Data
public class StudentDashboardDTO {

    private Long totalSessions;
    private Long upcomingSessions;
    private Long completedSessions;
    private Double totalSpent;
}
