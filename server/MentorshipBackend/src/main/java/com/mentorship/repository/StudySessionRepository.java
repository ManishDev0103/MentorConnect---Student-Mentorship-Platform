package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentorship.entities.StudySession;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    // Simplified query to avoid property path issues
    List<StudySession> findByStudent(com.mentorship.entities.Student student);
}
