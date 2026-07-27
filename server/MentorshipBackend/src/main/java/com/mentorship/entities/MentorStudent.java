package com.mentorship.entities;

import java.time.LocalDate;

import com.mentorship.entities.BaseEntity;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Student;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mentor_students",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"mentor_id", "student_id"},
           name = "uk_mentor_student"
       ))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MentorStudent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_mentorstudent_mentor"))
    private Mentor mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_mentorstudent_student"))
    private Student student;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private MentorStudentStatus status = MentorStudentStatus.ACTIVE;

    @Column(name = "total_sessions")
    private Integer totalSessions = 0;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "next_session_date")
    private LocalDate nextSessionDate;

    @Column(name = "next_session_time")
    private String nextSessionTime;
}
