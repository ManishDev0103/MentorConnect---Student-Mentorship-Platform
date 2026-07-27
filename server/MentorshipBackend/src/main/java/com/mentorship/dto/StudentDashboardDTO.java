package com.mentorship.dto;

import lombok.Data;

@Data
public class StudentDashboardDTO {

    private Long totalSessions;
    private Long upcomingSessions;
    private Long completedSessions;
    private Double totalSpent;
}
