package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private String activityType; // MENTOR_APPROVED, STUDENT_REGISTERED, REVENUE_MILESTONE, etc.
    private String title;
    private String description;
    private String userName;
    private String timeAgo;
}
