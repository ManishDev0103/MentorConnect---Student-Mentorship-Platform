package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RetentionChurnDto {
    private long monthlyActiveUsers;
    private double activeUsersGrowthPercent;
    
    private double retentionRate;
    private double retentionChange;
    
    private double churnRate;
    private double churnChange;
    
    private long avgLifetimeDays;
    private long avgLifetimeChange;
}
