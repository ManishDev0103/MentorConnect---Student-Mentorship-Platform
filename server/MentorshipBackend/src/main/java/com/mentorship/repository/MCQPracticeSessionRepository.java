package com.mentorship.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mentorship.entities.MCQPracticeSession;

public interface MCQPracticeSessionRepository extends JpaRepository<MCQPracticeSession, Long> {
    
    @Query("SELECT s FROM MCQPracticeSession s WHERE s.mentor.mentorId = :mentorId")
    List<MCQPracticeSession> findByMentorId(@Param("mentorId") Long mentorId);
    
    @Query("SELECT s FROM MCQPracticeSession s WHERE s.student.studentId = :studentId ORDER BY s.sessionNumber")
    List<MCQPracticeSession> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT s FROM MCQPracticeSession s WHERE s.mentor.mentorId = :mentorId AND s.student.studentId = :studentId ORDER BY s.sessionNumber")
    List<MCQPracticeSession> findByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(s) FROM MCQPracticeSession s WHERE s.mentor.mentorId = :mentorId AND s.student.studentId = :studentId")
    long countByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    @Query("SELECT s FROM MCQPracticeSession s WHERE s.mentor.mentorId = :mentorId AND s.student.studentId = :studentId AND s.sessionNumber = :sessionNumber")
    Optional<MCQPracticeSession> findByMentorIdAndStudentIdAndSessionNumber(
        @Param("mentorId") Long mentorId, 
        @Param("studentId") Long studentId, 
        @Param("sessionNumber") Integer sessionNumber
    );
    
    @Query("SELECT COUNT(s) FROM MCQPracticeSession s WHERE s.student.studentId = :studentId AND s.isCompleted = true")
    long countCompletedSessions(@Param("studentId") Long studentId);
}
