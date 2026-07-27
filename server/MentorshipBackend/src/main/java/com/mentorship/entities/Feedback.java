package com.mentorship.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "feedbacks")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Feedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_feedback_mentor"))
    private Mentor mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_feedback_student"))
    private Student student;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id",
                foreignKey = @ForeignKey(name = "fk_feedback_to_session"))
    private Session session;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "message", length = 1000)
    private String message;

    @Column(name = "feedback_date")
    private LocalDate feedbackDate;
}