package com.mentorship.controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.EarningsSummaryDTO;
import com.mentorship.dtos.MonthlyEarningsDTO;
import com.mentorship.dtos.TransactionDTO;
import com.mentorship.service.EarningsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/earnings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EarningsController {

    private static final Logger logger = LoggerFactory.getLogger(EarningsController.class);
    private final EarningsService earningsService;

    /**
     * Get earnings summary
     */
    @GetMapping("/{mentorId}/summary")
    public ResponseEntity<ApiResponseDTO<EarningsSummaryDTO>> getEarningsSummary(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/earnings/{}/summary - Fetching earnings summary", mentorId);
        try {
            EarningsSummaryDTO summary = earningsService.getEarningsSummary(mentorId);
            logger.info("Earnings summary fetched for mentorId: {}, total: {}", mentorId, summary.getTotalEarned());
            return ResponseEntity.ok(ApiResponseDTO.success(summary));
        } catch (Exception e) {
            logger.error("Error fetching earnings summary for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get total earnings
     */
    @GetMapping("/{mentorId}/total")
    public ResponseEntity<ApiResponseDTO<Double>> getTotalEarnings(@PathVariable Long mentorId) {
        try {
            Double total = earningsService.getTotalEarnings(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(total));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get this month's earnings
     */
    @GetMapping("/{mentorId}/this-month")
    public ResponseEntity<ApiResponseDTO<Double>> getThisMonthEarnings(@PathVariable Long mentorId) {
        try {
            Double earnings = earningsService.getThisMonthEarnings(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(earnings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get monthly earnings breakdown
     */
    @GetMapping("/{mentorId}/monthly")
    public ResponseEntity<ApiResponseDTO<List<MonthlyEarningsDTO>>> getMonthlyEarningsBreakdown(
            @PathVariable Long mentorId) {
        try {
            List<MonthlyEarningsDTO> breakdown = earningsService.getMonthlyEarningsBreakdown(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(breakdown));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get average earnings per session
     */
    @GetMapping("/{mentorId}/average")
    public ResponseEntity<ApiResponseDTO<Double>> getAveragePerSession(@PathVariable Long mentorId) {
        try {
            Double average = earningsService.getAveragePerSession(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(average));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get all transactions
     */
    @GetMapping("/{mentorId}/transactions")
    public ResponseEntity<ApiResponseDTO<List<TransactionDTO>>> getAllTransactions(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/earnings/{}/transactions - Fetching all transactions", mentorId);
        try {
            List<TransactionDTO> transactions = earningsService.getAllTransactions(mentorId);
            logger.info("Found {} transactions for mentorId: {}", transactions.size(), mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(transactions));
        } catch (Exception e) {
            logger.error("Error fetching transactions for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get recent transactions
     */
    @GetMapping("/{mentorId}/transactions/recent")
    public ResponseEntity<ApiResponseDTO<List<TransactionDTO>>> getRecentTransactions(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<TransactionDTO> transactions = earningsService.getRecentTransactions(mentorId, limit);
            return ResponseEntity.ok(ApiResponseDTO.success(transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get transactions between dates
     */
    @GetMapping("/{mentorId}/transactions/range")
    public ResponseEntity<ApiResponseDTO<List<TransactionDTO>>> getTransactionsBetweenDates(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<TransactionDTO> transactions = earningsService.getTransactionsBetweenDates(mentorId, startDate, endDate);
            return ResponseEntity.ok(ApiResponseDTO.success(transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
