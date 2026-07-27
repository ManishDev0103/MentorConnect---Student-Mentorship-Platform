package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsDto {
    private double totalRevenue;
    private double revenueGrowthPercent;
    
    private double thisMonthRevenue;
    private double monthlyGrowthPercent;
    
    private double avgTransaction;
    private long totalTransactions;
}
