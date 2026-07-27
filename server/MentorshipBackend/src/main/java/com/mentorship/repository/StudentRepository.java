package com.mentorship.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentorship.entities.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
	
	Optional<Student> findByUserDetails_UserId(Long userId);
	
}