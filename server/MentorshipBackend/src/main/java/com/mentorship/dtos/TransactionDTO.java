package com.mentorship.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private Long transactionId;
    private Long mentorId;
    private Long studentId;
    private String studentName;
    private Long sessionId;
    private Double amount;
    private Double mentorAmount;
    private Double platformCut;
    private LocalDate transactionDate;
    private String paymentStatus;
    private String paymentMethod;
    private String transactionReference;
    private String description;
}
