package com.mentorship.service;

import com.mentorship.dtos.*;
import java.util.List;

public interface MCQService {
    
    // Create MCQ question for a student
    MCQQuestionDTO createMCQQuestion(Long mentorId, CreateMCQQuestionDTO createDTO);
    
    // Get all MCQ questions created by mentor
    List<MCQQuestionDTO> getMCQQuestionsByMentor(Long mentorId);
    
    // Get MCQ questions for a specific student
    List<MCQQuestionDTO> getMCQQuestionsForStudent(Long mentorId, Long studentId);
    
    // Get MCQ question by ID
    MCQQuestionDTO getMCQQuestionById(Long questionId);
    
    // Update MCQ question
    MCQQuestionDTO updateMCQQuestion(Long questionId, CreateMCQQuestionDTO updateDTO);
    
    // Delete MCQ question
    void deleteMCQQuestion(Long questionId);
    
    // Get student MCQ statistics
    StudentMCQStatsDTO getStudentMCQStats(Long mentorId, Long studentId);
    
    // Get all attempts for a student
    List<MCQAttemptDTO> getStudentAttempts(Long mentorId, Long studentId);
    
    // Get attempts for a specific question
    List<MCQAttemptDTO> getQuestionAttempts(Long questionId);
    
    // Get MCQ questions by session ID (for students)
    List<MCQQuestionDTO> getMCQQuestionsBySession(Long sessionId);
    
    // Submit MCQ answer (for students)
    MCQAttemptDTO submitAnswer(Long studentId, SubmitMCQAnswerDTO submitDTO);
    
    // Get attempts for a session (for students)
    List<MCQAttemptDTO> getAttemptsForSession(Long studentId, Long sessionId);
}
