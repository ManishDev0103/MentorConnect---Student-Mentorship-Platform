package com.mentorship.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
//JPA annotation
@MappedSuperclass
public abstract class BaseEntity {

	@CreationTimestamp
	@Column(name="created_At")
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(name="last_updated")
	private LocalDateTime lastUpdated;
}
