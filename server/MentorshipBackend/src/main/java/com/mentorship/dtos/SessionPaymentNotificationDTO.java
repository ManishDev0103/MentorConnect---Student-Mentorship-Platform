package com.mentorship.dtos;

import lombok.Data;

@Data
public class SessionPaymentNotificationDTO {
    private Long sessionId;
    private String transactionId;
    private Double amount;
    private String status;
}
