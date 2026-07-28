package com.mentorship.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.SessionCreateDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.MentorAvailability;
import com.mentorship.entities.PaymentStatus;
import com.mentorship.entities.Session;
import com.mentorship.entities.SessionPayment;
import com.mentorship.entities.SessionStatus;
import com.mentorship.entities.Student;
import com.mentorship.entities.Transaction;
import com.mentorship.service.EmailService;
import com.mentorship.repository.MentorAvailabilityRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.SessionPaymentRepository;
import com.mentorship.repository.SessionRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionServiceImpl.class);
    
    private final SessionRepository sessionRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;
    private final MentorAvailabilityRepository availabilityRepository;
    private final SessionPaymentRepository sessionPaymentRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    @Override
    public List<SessionDTO> getAllSessions(Long mentorId) {
        // Auto-complete expired sessions first
        updateExpiredSessions();
        
        List<Session> sessions = sessionRepository.findByMentor_MentorId(mentorId);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SessionDTO getSessionById(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        return convertToDTO(session);
    }

    @Override
    public List<SessionDTO> getTodaysSessions(Long mentorId) {
        // Auto-complete expired sessions first
        updateExpiredSessions();
        
        LocalDate today = LocalDate.now();
        List<Session> sessions = sessionRepository.findTodaysSessions(mentorId, today);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionDTO> getUpcomingSessions(Long mentorId) {
        // Auto-complete expired sessions first
        updateExpiredSessions();
        
        LocalDate today = LocalDate.now();
        List<Session> sessions = sessionRepository.findUpcomingSessions(mentorId, today);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionDTO> getSessionsForDate(Long mentorId, LocalDate date) {
        List<Session> sessions = sessionRepository.findByMentor_MentorIdAndSessionDate(mentorId, date);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionDTO> getSessionsBetweenDates(Long mentorId, LocalDate startDate, LocalDate endDate) {
        List<Session> sessions = sessionRepository.findSessionsBetweenDates(mentorId, startDate, endDate);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SessionDTO createSession(Long mentorId, SessionCreateDTO sessionDTO) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        Student student = studentRepository.findById(sessionDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + sessionDTO.getStudentId()));

        Session session = new Session();
        session.setMentor(mentor);
        session.setStudent(student);
        session.setSessionDate(sessionDTO.getSessionDate());
        session.setStartTime(sessionDTO.getStartTime());
        session.setEndTime(sessionDTO.getEndTime());
        session.setTopic(sessionDTO.getTopic());
        session.setDescription(sessionDTO.getDescription());
        session.setSessionFee(sessionDTO.getSessionFee() != null ? sessionDTO.getSessionFee() : mentor.getRatePerSession());
        session.setStatus(SessionStatus.SCHEDULED);

        Session saved = sessionRepository.save(session);
        return convertToDTO(saved);
    }

    @Override
    public SessionDTO updateSession(Long sessionId, SessionDTO sessionDTO) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        if (sessionDTO.getSessionDate() != null) {
            session.setSessionDate(sessionDTO.getSessionDate());
        }
        if (sessionDTO.getStartTime() != null) {
            session.setStartTime(sessionDTO.getStartTime());
        }
        if (sessionDTO.getEndTime() != null) {
            session.setEndTime(sessionDTO.getEndTime());
        }
        if (sessionDTO.getTopic() != null) {
            session.setTopic(sessionDTO.getTopic());
        }
        if (sessionDTO.getDescription() != null) {
            session.setDescription(sessionDTO.getDescription());
        }
        if (sessionDTO.getNotes() != null) {
            session.setNotes(sessionDTO.getNotes());
        }

        Session updated = sessionRepository.save(session);
        return convertToDTO(updated);
    }

    @Override
    public void cancelSession(Long sessionId) {
        cancelSession(sessionId, null);
    }

    @Override
    public void cancelSession(Long sessionId, String cancellationReason) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        if (session.getStatus() == SessionStatus.COMPLETED
                || session.getStatus() == SessionStatus.CANCELLED_BY_STUDENT
                || session.getStatus() == SessionStatus.CANCELLED_BY_MENTOR) {
            throw new RuntimeException("Session cannot be cancelled");
        }

        // Release the booked time slot if the session was already reserved.
        MentorAvailability availability = availabilityRepository
                .findByMentor_MentorIdAndAvailableDateAndTimeSlot(
                        session.getMentor().getMentorId(),
                        session.getSessionDate(),
                        session.getStartTime())
                .orElse(null);

        if (availability != null && availability.getIsBooked()) {
            availability.setIsBooked(false);
            availability.setIsAvailable(true);
            availabilityRepository.save(availability);
        }

        session.setStatus(SessionStatus.CANCELLED_BY_MENTOR);
        session.setCancelledBy("MENTOR");
        session.setCancellationReason(cancellationReason);
        session.setCancelledAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Refund payments if any were already completed for this session.
        List<SessionPayment> payments = sessionPaymentRepository.findBySession_SessionId(sessionId);
        for (SessionPayment payment : payments) {
            if ("SUCCESS".equalsIgnoreCase(payment.getStatus()) &&
                    (payment.getRefundStatus() == null || !payment.getRefundStatus().equalsIgnoreCase("COMPLETED"))) {
                payment.setRefundStatus("COMPLETED");
                payment.setRefundAmount(payment.getAmount());
                payment.setRefundDate(LocalDateTime.now());
                payment.setRefundReason(cancellationReason != null ? cancellationReason : "Cancelled by mentor");
                sessionPaymentRepository.save(payment);
            }
        }

        List<Transaction> transactions = transactionRepository.findAllBySessionSessionId(sessionId);
        for (Transaction transaction : transactions) {
            if (transaction.getPaymentStatus() == PaymentStatus.COMPLETED) {
                transaction.setPaymentStatus(PaymentStatus.REFUNDED);
                transaction.setDescription("Session cancelled by mentor and refunded");
                transactionRepository.save(transaction);
            }
        }

        try {
            emailService.sendSessionPaymentStatusEmail(
                    session.getStudent().getUserDetails().getEmail(),
                    session.getStudent().getUserDetails().getFirstName() + " " + session.getStudent().getUserDetails().getLastName(),
                    session.getMentor().getUserDetails().getFirstName() + " " + session.getMentor().getUserDetails().getLastName(),
                    session.getSessionDate().toString(),
                    session.getStartTime().toString(),
                    session.getSessionFee(),
                    "REFUNDED");
        } catch (Exception e) {
            LoggerFactory.getLogger(SessionServiceImpl.class).warn("Failed to send refund notification email: {}", e.getMessage());
        }
    }

    @Override
    public void completeSession(Long sessionId, String notes) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        session.setStatus(SessionStatus.COMPLETED);
        if (notes != null) {
            session.setNotes(notes);
        }
        sessionRepository.save(session);
    }

    @Override
    public SessionDTO rescheduleSession(Long sessionId, LocalDate newDate, String newTime) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        
        session.setSessionDate(newDate);
        session.setStartTime(LocalTime.parse(newTime));
        session.setStatus(SessionStatus.RESCHEDULED);
        
        Session updated = sessionRepository.save(session);
        return convertToDTO(updated);
    }

    /**
     * Automatically update sessions to COMPLETED if their scheduled time has passed
     * and they are still in SCHEDULED status (not cancelled)
     */
    @Transactional
    public void updateExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        
        // Find all SCHEDULED sessions
        List<Session> scheduledSessions = sessionRepository.findByStatus(SessionStatus.SCHEDULED);
        
        int updatedCount = 0;
        for (Session session : scheduledSessions) {
            LocalDate sessionDate = session.getSessionDate();
            LocalTime endTime = session.getEndTime();
            
            // Check if session has passed
            boolean hasExpired = false;
            
            if (sessionDate.isBefore(today)) {
                // Session date is in the past
                hasExpired = true;
            } else if (sessionDate.isEqual(today) && endTime != null && endTime.isBefore(currentTime)) {
                // Session is today but end time has passed
                hasExpired = true;
            }
            
            if (hasExpired) {
                session.setStatus(SessionStatus.COMPLETED);
                sessionRepository.save(session);
                updatedCount++;
                logger.info("Auto-completed session {} (Date: {}, EndTime: {})", 
                    session.getSessionId(), sessionDate, endTime);
            }
        }
        
        if (updatedCount > 0) {
            logger.info("Auto-completed {} expired sessions", updatedCount);
        }
    }
    
    /**
     * Scheduled task to automatically update expired sessions every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Run every hour at minute 0
    public void scheduledUpdateExpiredSessions() {
        logger.info("Running scheduled task to update expired sessions");
        updateExpiredSessions();
    }

    private SessionDTO convertToDTO(Session session) {
        String studentName = session.getStudent().getUserDetails().getFirstName() + " " +
                            session.getStudent().getUserDetails().getLastName();
        
        return SessionDTO.builder()
                .sessionId(session.getSessionId())
                .mentorId(session.getMentor().getMentorId())
                .studentId(session.getStudent().getStudentId())
                .studentName(studentName)
                .sessionDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .topic(session.getTopic())
                .description(session.getDescription())
                .status(session.getStatus().name())
                .cancelledBy(session.getCancelledBy())
                .cancellationReason(session.getCancellationReason())
                .cancelledAt(session.getCancelledAt())
                .sessionFee(session.getSessionFee())
                .notes(session.getNotes())
                .build();
    }
}
