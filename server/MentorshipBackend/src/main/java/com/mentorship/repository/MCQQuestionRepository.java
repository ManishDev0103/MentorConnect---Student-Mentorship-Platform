package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mentorship.entities.MCQQuestion;

public interface MCQQuestionRepository extends JpaRepository<MCQQuestion, Long> {
    
    @Query("SELECT q FROM MCQQuestion q WHERE q.mentor.mentorId = :mentorId")
    List<MCQQuestion> findByMentorId(@Param("mentorId") Long mentorId);
    
    @Query("SELECT q FROM MCQQuestion q WHERE q.student.studentId = :studentId")
    List<MCQQuestion> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT q FROM MCQQuestion q WHERE q.mentor.mentorId = :mentorId AND q.student.studentId = :studentId")
    List<MCQQuestion> findByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    @Query("SELECT q FROM MCQQuestion q WHERE q.mentor.mentorId = :mentorId AND q.topic = :topic")
    List<MCQQuestion> findByMentorIdAndTopic(@Param("mentorId") Long mentorId, @Param("topic") String topic);
    
    @Query("SELECT COUNT(q) FROM MCQQuestion q WHERE q.mentor.mentorId = :mentorId AND q.student.studentId = :studentId")
    long countByMentorIdAndStudentId(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    @Query("SELECT q FROM MCQQuestion q WHERE q.session.sessionId = :sessionId")
    List<MCQQuestion> findBySessionId(@Param("sessionId") Long sessionId);
}
