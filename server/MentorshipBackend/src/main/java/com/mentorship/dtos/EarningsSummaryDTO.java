package com.mentorship.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarningsSummaryDTO {
    private Double totalEarned;
    private Double thisMonthEarnings;
    private Double averagePerSession;
    private Integer totalTransactions;
    private List<MonthlyEarningsDTO> monthlyEarnings;
    private List<TransactionDTO> recentTransactions;
}
