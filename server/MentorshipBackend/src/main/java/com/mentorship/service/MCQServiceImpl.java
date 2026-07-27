package com.mentorship.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.CreateMCQQuestionDTO;
import com.mentorship.dtos.MCQAttemptDTO;
import com.mentorship.dtos.MCQQuestionDTO;
import com.mentorship.dtos.StudentMCQStatsDTO;
import com.mentorship.dtos.SubmitMCQAnswerDTO;
import com.mentorship.entities.MCQAttempt;
import com.mentorship.entities.MCQQuestion;
import com.mentorship.entities.MCQPracticeSession;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Student;
import com.mentorship.repository.MCQAttemptRepository;
import com.mentorship.repository.MCQQuestionRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.repository.MCQPracticeSessionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MCQServiceImpl implements MCQService {
    
    private final MCQQuestionRepository mcqQuestionRepository;
    private final MCQAttemptRepository mcqAttemptRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;
    private final MCQPracticeSessionRepository sessionRepository;
    
    @Override
    public MCQQuestionDTO createMCQQuestion(Long mentorId, CreateMCQQuestionDTO createDTO) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        Student student = studentRepository.findById(createDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + createDTO.getStudentId()));
        
        // Get the session if sessionId is provided
        MCQPracticeSession session = null;
        if (createDTO.getSessionId() != null) {
            session = sessionRepository.findById(createDTO.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Practice session not found with id: " + createDTO.getSessionId()));
        }
        
        MCQQuestion question = new MCQQuestion();
        question.setMentor(mentor);
        question.setStudent(student);
        question.setSession(session);
        question.setTopic(createDTO.getTopic());
        question.setQuestionText(createDTO.getQuestionText());
        question.setOptionA(createDTO.getOptionA());
        question.setOptionB(createDTO.getOptionB());
        question.setOptionC(createDTO.getOptionC());
        question.setOptionD(createDTO.getOptionD());
        question.setCorrectAnswer(createDTO.getCorrectAnswer().toUpperCase());
        question.setExplanation(createDTO.getExplanation());
        question.setDifficultyLevel(createDTO.getDifficultyLevel());
        
        MCQQuestion saved = mcqQuestionRepository.save(question);
        
        // Update session progress if question belongs to a session
        if (session != null) {
            session.addQuestion(saved);
            sessionRepository.save(session);
        }
        
        return convertToDTO(saved);
    }
    
    @Override
    public List<MCQQuestionDTO> getMCQQuestionsByMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        List<MCQQuestion> questions = mcqQuestionRepository.findByMentorId(mentorId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MCQQuestionDTO> getMCQQuestionsForStudent(Long mentorId, Long studentId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        List<MCQQuestion> questions = mcqQuestionRepository.findByMentorIdAndStudentId(mentorId, studentId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public MCQQuestionDTO getMCQQuestionById(Long questionId) {
        MCQQuestion question = mcqQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        return convertToDTO(question);
    }
    
    @Override
    public MCQQuestionDTO updateMCQQuestion(Long questionId, CreateMCQQuestionDTO updateDTO) {
        MCQQuestion question = mcqQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        
        question.setTopic(updateDTO.getTopic());
        question.setQuestionText(updateDTO.getQuestionText());
        question.setOptionA(updateDTO.getOptionA());
        question.setOptionB(updateDTO.getOptionB());
        question.setOptionC(updateDTO.getOptionC());
        question.setOptionD(updateDTO.getOptionD());
        question.setCorrectAnswer(updateDTO.getCorrectAnswer().toUpperCase());
        question.setExplanation(updateDTO.getExplanation());
        question.setDifficultyLevel(updateDTO.getDifficultyLevel());
        
        MCQQuestion updated = mcqQuestionRepository.save(question);
        return convertToDTO(updated);
    }
    
    @Override
    public void deleteMCQQuestion(Long questionId) {
        mcqQuestionRepository.deleteById(questionId);
    }
    
    @Override
    public StudentMCQStatsDTO getStudentMCQStats(Long mentorId, Long studentId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        List<MCQQuestion> questions = mcqQuestionRepository.findByMentorIdAndStudentId(mentorId, studentId);
        Long totalAttempts = mcqAttemptRepository.countTotalByStudentId(studentId);
        Long correctAttempts = mcqAttemptRepository.countCorrectByStudentId(studentId);
        
        double accuracy = totalAttempts > 0 ? (correctAttempts * 100.0) / totalAttempts : 0.0;
        
        int questionsAttempted = (int) questions.stream()
                .filter(q -> !q.getAttempts().isEmpty())
                .count();
        
        String studentName = student.getUserDetails().getFirstName() + " " + student.getUserDetails().getLastName();
        
        return StudentMCQStatsDTO.builder()
                .studentId(studentId)
                .studentName(studentName)
                .totalQuestions(questions.size())
                .totalAttempts(totalAttempts.intValue())
                .correctAttempts(correctAttempts.intValue())
                .accuracyPercentage(Math.round(accuracy * 10.0) / 10.0)
                .questionsAttempted(questionsAttempted)
                .questionsRemaining(questions.size() - questionsAttempted)
                .build();
    }
    
    @Override
    public List<MCQAttemptDTO> getStudentAttempts(Long mentorId, Long studentId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        List<MCQAttempt> attempts = mcqAttemptRepository.findByMentorIdAndStudentId(mentorId, studentId);
        return attempts.stream()
                .map(this::convertAttemptToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MCQAttemptDTO> getQuestionAttempts(Long questionId) {
        List<MCQAttempt> attempts = mcqAttemptRepository.findByQuestionId(questionId);
        return attempts.stream()
                .map(this::convertAttemptToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MCQQuestionDTO> getMCQQuestionsBySession(Long sessionId) {
        List<MCQQuestion> questions = mcqQuestionRepository.findBySessionId(sessionId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public MCQAttemptDTO submitAnswer(Long studentId, SubmitMCQAnswerDTO submitDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        MCQQuestion question = mcqQuestionRepository.findById(submitDTO.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + submitDTO.getQuestionId()));
        
        MCQPracticeSession session = sessionRepository.findById(submitDTO.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + submitDTO.getSessionId()));
        
        // Create attempt
        MCQAttempt attempt = new MCQAttempt();
        attempt.setQuestion(question);
        attempt.setStudent(student);
        attempt.setSession(session);
        attempt.setSelectedAnswer(submitDTO.getSelectedAnswer().toUpperCase());
        attempt.setIsCorrect(submitDTO.getSelectedAnswer().equalsIgnoreCase(question.getCorrectAnswer()));
        attempt.setAttemptedAt(LocalDateTime.now());
        
        MCQAttempt saved = mcqAttemptRepository.save(attempt);
        
        // Update session progress
        updateSessionProgress(session);
        
        return convertAttemptToDTO(saved);
    }
    
    @Override
    public List<MCQAttemptDTO> getAttemptsForSession(Long studentId, Long sessionId) {
        List<MCQAttempt> attempts = mcqAttemptRepository.findByStudentIdAndSessionId(studentId, sessionId);
        return attempts.stream()
                .map(this::convertAttemptToDTO)
                .collect(Collectors.toList());
    }
    
    private void updateSessionProgress(MCQPracticeSession session) {
        // Get all attempts for this session
        List<MCQAttempt> attempts = mcqAttemptRepository.findBySessionId(session.getSessionId());
        
        // Count unique questions attempted
        long uniqueQuestionsAttempted = attempts.stream()
                .map(a -> a.getQuestion().getQuestionId())
                .distinct()
                .count();
        
        // Count correct answers
        long correctAnswers = attempts.stream()
                .filter(MCQAttempt::getIsCorrect)
                .count();
        
        session.setCompletedQuestions((int) uniqueQuestionsAttempted);
        session.setCorrectAnswers((int) correctAnswers);
        
        // Mark as completed if all questions are attempted
        if (uniqueQuestionsAttempted >= session.getTotalQuestions() && session.getTotalQuestions() > 0) {
            session.setIsCompleted(true);
            session.setCompletedAt(LocalDateTime.now());
        }
        
        sessionRepository.save(session);
    }
    
    private MCQQuestionDTO convertToDTO(MCQQuestion question) {
        String studentName = question.getStudent().getUserDetails().getFirstName() + " " +
                question.getStudent().getUserDetails().getLastName();
        
        int totalAttempts = question.getAttempts().size();
        int correctAttempts = (int) question.getAttempts().stream()
                .filter(MCQAttempt::getIsCorrect)
                .count();
        
        Long sessionId = question.getSession() != null ? question.getSession().getSessionId() : null;
        
        return MCQQuestionDTO.builder()
                .questionId(question.getQuestionId())
                .mentorId(question.getMentor().getMentorId())
                .studentId(question.getStudent().getStudentId())
                .studentName(studentName)
                .sessionId(sessionId)
                .topic(question.getTopic())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .difficultyLevel(question.getDifficultyLevel())
                .totalAttempts(totalAttempts)
                .correctAttempts(correctAttempts)
                .build();
    }
    
    private MCQAttemptDTO convertAttemptToDTO(MCQAttempt attempt) {
        String studentName = attempt.getStudent().getUserDetails().getFirstName() + " " +
                attempt.getStudent().getUserDetails().getLastName();
        
        Long sessionId = attempt.getSession() != null ? attempt.getSession().getSessionId() : null;
        
        return MCQAttemptDTO.builder()
                .attemptId(attempt.getAttemptId())
                .questionId(attempt.getQuestion().getQuestionId())
                .questionText(attempt.getQuestion().getQuestionText())
                .topic(attempt.getQuestion().getTopic())
                .studentId(attempt.getStudent().getStudentId())
                .studentName(studentName)
                .sessionId(sessionId)
                .selectedAnswer(attempt.getSelectedAnswer())
                .correctAnswer(attempt.getQuestion().getCorrectAnswer())
                .isCorrect(attempt.getIsCorrect())
                .attemptedAt(attempt.getAttemptedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .build();
    }
}
