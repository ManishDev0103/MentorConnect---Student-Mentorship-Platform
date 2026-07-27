package com.mentorship.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "mcq_practice_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQPracticeSession extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber; // 1 to 10
    
    @Column(name = "session_title", nullable = false)
    private String sessionTitle;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;
    
    @Column(name = "completed_questions")
    private Integer completedQuestions = 0;
    
    @Column(name = "correct_answers")
    private Integer correctAnswers = 0;
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MCQQuestion> questions = new ArrayList<>();
    
    public void addQuestion(MCQQuestion question) {
        questions.add(question);
        question.setSession(this);
        this.totalQuestions = questions.size();
    }
    
    public void removeQuestion(MCQQuestion question) {
        questions.remove(question);
        question.setSession(null);
        this.totalQuestions = questions.size();
    }
    
    public double getAccuracyPercentage() {
        if (completedQuestions == 0) return 0.0;
        return (correctAnswers * 100.0) / completedQuestions;
    }
}
