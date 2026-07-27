package com.mentorship.entities;

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "students")
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper=true, exclude= {"userDetails"})
public class Student extends BaseEntity {
	
	@Id //PK constraint
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long studentId;
	
	@OneToOne(optional = false,cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
	private User userDetails;
    
    @Column(name="target_domain",length = 100)
    private String targetDomain;
    
    private String qualification;
}
