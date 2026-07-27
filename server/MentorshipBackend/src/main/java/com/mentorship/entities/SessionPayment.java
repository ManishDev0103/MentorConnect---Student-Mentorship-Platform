package com.mentorship.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "session_payments")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SessionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_student"))
    private Student student;

    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_mentor"))
    private Mentor mentor;

    @OneToOne
    @JoinColumn(name = "session_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_payment_session"))
    private Session session;

    @Column(name = "transaction_id", nullable = false, length = 100)
    private String transactionId;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "payment_time", nullable = false)
    private LocalDateTime paymentTime;

    @Column(name = "status", nullable = false)
    private String status; // SUCCESS, FAILED
}
