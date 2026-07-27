package com.mentorship.entities;

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

@Entity
@Table(name = "mcq_questions")
@Getter
@Setter
@NoArgsConstructor
public class MCQQuestion extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private MCQPracticeSession session;
    
    @Column(name = "topic", length = 200, nullable = false)
    private String topic;
    
    @Column(name = "question_text", length = 1000, nullable = false)
    private String questionText;
    
    @Column(name = "option_a", length = 500, nullable = false)
    private String optionA;
    
    @Column(name = "option_b", length = 500, nullable = false)
    private String optionB;
    
    @Column(name = "option_c", length = 500, nullable = false)
    private String optionC;
    
    @Column(name = "option_d", length = 500, nullable = false)
    private String optionD;
    
    @Column(name = "correct_answer", length = 1, nullable = false)
    private String correctAnswer; // A, B, C, or D
    
    @Column(name = "explanation", length = 1000)
    private String explanation;
    
    @Column(name = "difficulty_level", length = 20)
    private String difficultyLevel; // EASY, MEDIUM, HARD
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MCQAttempt> attempts = new ArrayList<>();
}
