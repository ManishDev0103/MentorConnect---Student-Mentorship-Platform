package com.mentorship.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.CreateMCQSessionDTO;
import com.mentorship.dtos.MCQPracticeSessionDTO;
import com.mentorship.entities.MCQPracticeSession;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Student;
import com.mentorship.repository.MCQPracticeSessionRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MCQPracticeSessionService {
    
    private final MCQPracticeSessionRepository sessionRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;
    
    public MCQPracticeSessionDTO createSession(Long mentorId, CreateMCQSessionDTO createDTO) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        Student student = studentRepository.findById(createDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + createDTO.getStudentId()));
        
        // Check if student already has 10 practice sessions
        long existingCount = sessionRepository.countByMentorIdAndStudentId(mentor.getMentorId(), student.getStudentId());
        if (existingCount >= 10) {
            throw new RuntimeException("Maximum limit of 10 practice sessions per student reached.");
        }
        
        // Check if session number already exists
        if (sessionRepository.findByMentorIdAndStudentIdAndSessionNumber(
                mentor.getMentorId(), student.getStudentId(), createDTO.getSessionNumber()).isPresent()) {
            throw new RuntimeException("Session number " + createDTO.getSessionNumber() + " already exists for this student.");
        }
        
        MCQPracticeSession session = new MCQPracticeSession();
        session.setMentor(mentor);
        session.setStudent(student);
        session.setSessionNumber(createDTO.getSessionNumber());
        session.setSessionTitle(createDTO.getSessionTitle());
        session.setDescription(createDTO.getDescription());
        session.setStartedAt(LocalDateTime.now());
        
        MCQPracticeSession saved = sessionRepository.save(session);
        return convertToDTO(saved);
    }
    
    public List<MCQPracticeSessionDTO> getSessionsByMentorAndStudent(Long mentorId, Long studentId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        List<MCQPracticeSession> sessions = sessionRepository.findByMentorIdAndStudentId(mentorId, studentId);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MCQPracticeSessionDTO> getSessionsByStudent(Long studentId) {
        List<MCQPracticeSession> sessions = sessionRepository.findByStudentId(studentId);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public MCQPracticeSessionDTO getSessionById(Long sessionId) {
        MCQPracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        return convertToDTO(session);
    }
    
    public void deleteSession(Long sessionId) {
        MCQPracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        sessionRepository.delete(session);
    }
    
    public MCQPracticeSessionDTO updateSessionProgress(Long sessionId) {
        MCQPracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        
        // Manually update progress by querying questions
        int totalQuestions = session.getQuestions().size();
        session.setTotalQuestions(totalQuestions);
        
        MCQPracticeSession updated = sessionRepository.save(session);
        return convertToDTO(updated);
    }
    
    private MCQPracticeSessionDTO convertToDTO(MCQPracticeSession session) {
        String studentName = session.getStudent().getUserDetails().getFirstName() + " " +
                           session.getStudent().getUserDetails().getLastName();
        
        return MCQPracticeSessionDTO.builder()
                .sessionId(session.getSessionId())
                .sessionNumber(session.getSessionNumber())
                .sessionTitle(session.getSessionTitle())
                .description(session.getDescription())
                .totalQuestions(session.getTotalQuestions())
                .completedQuestions(session.getCompletedQuestions())
                .correctAnswers(session.getCorrectAnswers())
                .isCompleted(session.getIsCompleted())
                .accuracyPercentage(session.getAccuracyPercentage())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .studentId(session.getStudent().getStudentId())
                .studentName(studentName)
                .build();
    }
}
