package com.mentorship.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ratings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Rating extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_rating_mentor"))
    private Mentor mentor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_rating_student"))
    private Student student;
    
    @Column(name = "rating_value", nullable = false)
    private double ratingValue; // 1-5
    
    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;
    
    @Column(name = "is_active")
    private boolean isActive = true;
}
