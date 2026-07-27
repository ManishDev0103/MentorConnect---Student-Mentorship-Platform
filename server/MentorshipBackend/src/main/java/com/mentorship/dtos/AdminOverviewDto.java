package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDto {
    private long totalStudents;
    private double studentGrowthPercent;
    
    private long totalMentors;
    private double mentorGrowthPercent;
    
    private long activeSessions;
    private double sessionGrowthPercent;
    
    private double monthlyRevenue;
    private double revenueGrowthPercent;
}
