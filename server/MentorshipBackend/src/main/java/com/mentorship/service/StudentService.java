package com.mentorship.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.mentorship.dtos.*;
import com.mentorship.entities.StudentSubscription;
import com.mentorship.entities.StudySession;
import java.time.LocalDate;
import java.util.List;

public interface StudentService {
    
    /**
     * Get student's next upcoming session
     */
    SessionDTO getNextSession(Long studentId);
    
    /**
     * Get all upcoming sessions for student
     */
    List<SessionDTO> getUpcomingSessions(Long studentId);
    
    /**
     * Get all past sessions for student
     */
    List<SessionDTO> getPastSessions(Long studentId);
    
    /**
     * Get mentor's available time slots for a specific date
     */
    DayAvailabilityDTO getMentorAvailableSlots(Long mentorId, LocalDate date);
    
    /**
     * Get mentor's available time slots for a date range
     */
    List<DayAvailabilityDTO> getMentorAvailableSlots(Long mentorId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Get all sessions for student
     */
    List<SessionDTO> getAllSessions(Long studentId);
    
    // Student CRUD Methods
    StudentDTO getStudentById(Long id);
    StudentDTO getStudentByUserId(Long userId);  // Add this method
    List<StudentDTO> getAllStudents();
    StudentDTO createStudent(StudentDTO dto);
    StudentDTO updateStudent(Long id, StudentDTO dto);
    void uploadProfileImage(Long studentId, byte[] imageBytes);
    byte[] getProfileImage(Long studentId);
    void uploadResume(Long studentId, MultipartFile resume);
    ResponseEntity<byte[]> downloadResume(Long studentId);
    boolean deleteStudent(Long id);
    
    // Mentor Browsing & Subscription Methods
    List<MentorDTO> getVerifiedMentors(Long studentId, String domain);
    StudentSubscription getActiveSubscription(Long studentId);
    StudentSubscription saveSubscription(StudentSubscription sub);
    MentorDTO getMentorDetails(Long mentorId);
    
    // Session Booking & Payment Methods
    StudentSessionDTO bookSession(Long studentId, StudentSessionDTO dto);
    void processSessionPayment(SessionPaymentNotificationDTO dto);
    List<StudentSessionResponseDTO> getStudentSessions(Long studentId);
    StudentDashboardDTO getStudentDashboard(Long studentId);
    void cancelSession(Long sessionId);
    void deleteSession(Long sessionId);
    
    // Feedback Methods
    FeedbackResponseDTO giveFeedback(Long studentId, FeedbackRequestDTO dto);
    List<FeedbackResponseDTO> getStudentFeedbacks(Long studentId);
    
    // Study Timer Methods
    StudySession startStudySession(Long studentId, String taskName);
    StudySession stopStudySession(Long sessionId);
    void deleteStudySession(Long sessionId);
    List<StudySession> getStudyHistory(Long studentId);
}
