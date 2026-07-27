package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mentorship.entities.MCQAttempt;

public interface MCQAttemptRepository extends JpaRepository<MCQAttempt, Long> {
    
    @Query("SELECT a FROM MCQAttempt a WHERE a.student.studentId = :studentId ORDER BY a.attemptedAt DESC")
    List<MCQAttempt> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT a FROM MCQAttempt a WHERE a.question.questionId = :questionId ORDER BY a.attemptedAt DESC")
    List<MCQAttempt> findByQuestionId(@Param("questionId") Long questionId);
    
    @Query("SELECT COUNT(a) FROM MCQAttempt a WHERE a.student.studentId = :studentId AND a.isCorrect = true")
    Long countCorrectByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM MCQAttempt a WHERE a.student.studentId = :studentId")
    Long countTotalByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT a FROM MCQAttempt a WHERE a.question.mentor.mentorId = :mentorId AND a.student.studentId = :studentId ORDER BY a.attemptedAt DESC")
    List<MCQAttempt> findByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    @Query("SELECT a FROM MCQAttempt a WHERE a.session.sessionId = :sessionId ORDER BY a.attemptedAt DESC")
    List<MCQAttempt> findBySessionId(@Param("sessionId") Long sessionId);
    
    @Query("SELECT a FROM MCQAttempt a WHERE a.student.studentId = :studentId AND a.session.sessionId = :sessionId ORDER BY a.attemptedAt DESC")
    List<MCQAttempt> findByStudentIdAndSessionId(@Param("studentId") Long studentId, @Param("sessionId") Long sessionId);
}
