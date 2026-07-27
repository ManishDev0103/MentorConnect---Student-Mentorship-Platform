package com.mentorship.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.PaymentStatus;
import com.mentorship.entities.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find all transactions for a mentor
    List<Transaction> findByMentor_MentorIdOrderByTransactionDateDesc(Long mentorId);
    
    // Find transaction by session ID (to avoid duplicates)
    Optional<Transaction> findBySessionSessionId(Long sessionId);

    // Find all transactions linked to a session
    List<Transaction> findAllBySessionSessionId(Long sessionId);

    // Find transactions by status
    List<Transaction> findByMentor_MentorIdAndPaymentStatus(Long mentorId, PaymentStatus status);

    // Calculate total earnings for a mentor
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.mentor.mentorId = :mentorId AND t.paymentStatus = 'COMPLETED'")
    Double calculateTotalEarnings(@Param("mentorId") Long mentorId);

    // Calculate this month's earnings
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.mentor.mentorId = :mentorId " +
           "AND t.paymentStatus = 'COMPLETED' AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
    Double calculateMonthlyEarnings(@Param("mentorId") Long mentorId, @Param("year") Integer year, @Param("month") Integer month);

    // Get monthly earnings breakdown
    @Query("SELECT MONTH(t.transactionDate) as month, YEAR(t.transactionDate) as year, SUM(t.amount) as total " +
           "FROM Transaction t WHERE t.mentor.mentorId = :mentorId AND t.paymentStatus = 'COMPLETED' " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate) " +
           "ORDER BY YEAR(t.transactionDate) DESC, MONTH(t.transactionDate) DESC")
    List<Object[]> getMonthlyEarningsBreakdown(@Param("mentorId") Long mentorId);

    // Find recent transactions
    @Query("SELECT t FROM Transaction t WHERE t.mentor.mentorId = :mentorId ORDER BY t.transactionDate DESC LIMIT :limit")
    List<Transaction> findRecentTransactions(@Param("mentorId") Long mentorId, @Param("limit") Integer limit);

    // Find transactions between dates
    @Query("SELECT t FROM Transaction t WHERE t.mentor.mentorId = :mentorId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findTransactionsBetweenDates(@Param("mentorId") Long mentorId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    // Count total transactions
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.mentor.mentorId = :mentorId AND t.paymentStatus = 'COMPLETED'")
    Integer countCompletedTransactions(@Param("mentorId") Long mentorId);

    // Calculate average per session
    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t WHERE t.mentor.mentorId = :mentorId AND t.paymentStatus = 'COMPLETED'")
    Double calculateAveragePerSession(@Param("mentorId") Long mentorId);

    List<Transaction> findByPaymentStatus(String status);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.paymentStatus = 'COMPLETED' AND YEAR(t.createdAt) = :year AND MONTH(t.createdAt) = :month")
    Double getMonthlyRevenue(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.paymentStatus = 'COMPLETED' AND YEAR(t.createdAt) = :year AND MONTH(t.createdAt) = :month")
    long getMonthlyTransactionCount(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.paymentStatus = 'COMPLETED'")
    Double getTotalRevenue();
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.paymentStatus = 'COMPLETED'")
    long getTotalTransactionCount();
    
    @Query("SELECT t FROM Transaction t WHERE t.paymentStatus = 'COMPLETED' AND t.createdAt >= :startDate AND t.createdAt <= :endDate")
    List<Transaction> getTransactionsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

}
