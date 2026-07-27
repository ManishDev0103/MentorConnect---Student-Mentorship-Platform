package com.mentorship.service;

import java.time.LocalDate;
import java.util.List;

import com.mentorship.dtos.EarningsSummaryDTO;
import com.mentorship.dtos.MonthlyEarningsDTO;
import com.mentorship.dtos.TransactionDTO;

public interface EarningsService {
    
    // Get earnings summary
    EarningsSummaryDTO getEarningsSummary(Long mentorId);
    
    // Get total earnings
    Double getTotalEarnings(Long mentorId);
    
    // Get this month's earnings
    Double getThisMonthEarnings(Long mentorId);
    
    // Get monthly earnings breakdown
    List<MonthlyEarningsDTO> getMonthlyEarningsBreakdown(Long mentorId);
    
    // Get average per session
    Double getAveragePerSession(Long mentorId);
    
    // Get all transactions
    List<TransactionDTO> getAllTransactions(Long mentorId);
    
    // Get recent transactions
    List<TransactionDTO> getRecentTransactions(Long mentorId, Integer limit);
    
    // Get transactions between dates
    List<TransactionDTO> getTransactionsBetweenDates(Long mentorId, LocalDate startDate, LocalDate endDate);
}
