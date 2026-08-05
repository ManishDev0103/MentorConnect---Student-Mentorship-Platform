package com.mentorship.service;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.EarningsSummaryDTO;
import com.mentorship.dtos.MonthlyEarningsDTO;
import com.mentorship.dtos.TransactionDTO;
import com.mentorship.entities.Transaction;
import com.mentorship.repository.TransactionRepository;
import com.mentorship.service.EarningsService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EarningsServiceImpl implements EarningsService {

    private final TransactionRepository transactionRepository;

    @Override
    public EarningsSummaryDTO getEarningsSummary(Long mentorId) {
        Double totalEarned = transactionRepository.calculateTotalEarnings(mentorId);
        Double thisMonth = getThisMonthEarnings(mentorId);
        Double avgPerSession = transactionRepository.calculateAveragePerSession(mentorId);
        Integer totalTransactions = transactionRepository.countCompletedTransactions(mentorId);
        List<MonthlyEarningsDTO> monthlyEarnings = getMonthlyEarningsBreakdown(mentorId);
        List<TransactionDTO> recentTransactions = getRecentTransactions(mentorId, 5);

        return EarningsSummaryDTO.builder()
                .totalEarned(totalEarned != null ? totalEarned : 0.0)
                .thisMonthEarnings(thisMonth)
                .averagePerSession(avgPerSession != null ? Math.round(avgPerSession * 100.0) / 100.0 : 0.0)
                .totalTransactions(totalTransactions != null ? totalTransactions : 0)
                .monthlyEarnings(monthlyEarnings)
                .recentTransactions(recentTransactions)
                .build();
    }

    @Override
    public Double getTotalEarnings(Long mentorId) {
        Double total = transactionRepository.calculateTotalEarnings(mentorId);
        return total != null ? total : 0.0;
    }

    @Override
    public Double getThisMonthEarnings(Long mentorId) {
        LocalDate now = LocalDate.now();
        Double earnings = transactionRepository.calculateMonthlyEarnings(mentorId, now.getYear(), now.getMonthValue());
        return earnings != null ? earnings : 0.0;
    }

    @Override
    public List<MonthlyEarningsDTO> getMonthlyEarningsBreakdown(Long mentorId) {
        List<Object[]> breakdown = transactionRepository.getMonthlyEarningsBreakdown(mentorId);
        List<MonthlyEarningsDTO> result = new ArrayList<>();

        for (Object[] row : breakdown) {
            Integer month = (Integer) row[0];
            Integer year = (Integer) row[1];
            Double total = (Double) row[2];

            String monthName = Month.of(month).name();
            monthName = monthName.substring(0, 1) + monthName.substring(1).toLowerCase();

            result.add(MonthlyEarningsDTO.builder()
                    .month(monthName)
                    .year(year)
                    .earnings(total)
                    .build());
        }

        return result;
    }

    @Override
    public Double getAveragePerSession(Long mentorId) {
        Double avg = transactionRepository.calculateAveragePerSession(mentorId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    @Override
    public List<TransactionDTO> getAllTransactions(Long mentorId) {
        List<Transaction> transactions = transactionRepository.findByMentor_MentorIdOrderByTransactionDateDesc(mentorId);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDTO> getRecentTransactions(Long mentorId, Integer limit) {
        List<Transaction> transactions = transactionRepository.findRecentTransactions(mentorId, limit);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDTO> getTransactionsBetweenDates(Long mentorId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findTransactionsBetweenDates(mentorId, startDate, endDate);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        String studentName = transaction.getStudent().getUserDetails().getFirstName() + " " +
                            transaction.getStudent().getUserDetails().getLastName();

        return TransactionDTO.builder()
                .transactionId(transaction.getTransactionId())
                .mentorId(transaction.getMentor().getMentorId())
                .studentId(transaction.getStudent().getStudentId())
                .studentName(studentName)
                .sessionId(transaction.getSession() != null ? transaction.getSession().getSessionId() : null)
                .amount(transaction.getAmount())
                .mentorAmount(transaction.getMentorAmount())
                .platformCut(transaction.getPlatformCut())
                .transactionDate(transaction.getTransactionDate())
                .paymentStatus(transaction.getPaymentStatus().name())
                .paymentMethod(transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : null)
                .transactionReference(transaction.getTransactionReference())
                .description(transaction.getDescription())
                .build();
    }
}
