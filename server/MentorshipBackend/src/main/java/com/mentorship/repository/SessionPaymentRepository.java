package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mentorship.entities.SessionPayment;

public interface SessionPaymentRepository extends JpaRepository<SessionPayment, Long> {
    
    // Find all payments by status (for migration purposes)
    List<SessionPayment> findByStatus(String status);

    // Find payment for a given session
    List<SessionPayment> findBySession_SessionId(Long sessionId);
}
