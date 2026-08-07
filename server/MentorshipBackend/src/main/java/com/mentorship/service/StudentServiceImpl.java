package com.mentorship.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.DayAvailabilityDTO;
import com.mentorship.dtos.FeedbackRequestDTO;
import com.mentorship.dtos.FeedbackResponseDTO;
import com.mentorship.dtos.MentorDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.dtos.SessionPaymentNotificationDTO;
import com.mentorship.dtos.StudentDTO;
import com.mentorship.dtos.StudentDashboardDTO;
import com.mentorship.dtos.StudentSessionDTO;
import com.mentorship.dtos.StudentSessionResponseDTO;
import com.mentorship.dtos.TimeSlotDTO;
import com.mentorship.entities.Feedback;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.MentorAvailability;
import com.mentorship.entities.MentorStudent;
import com.mentorship.entities.MentorStudentStatus;
import com.mentorship.entities.PaymentMethod;
import com.mentorship.entities.PaymentStatus;
import com.mentorship.entities.Session;
import com.mentorship.entities.SessionPayment;
import com.mentorship.entities.SessionStatus;
import com.mentorship.entities.Student;
import com.mentorship.entities.StudentSubscription;
import com.mentorship.entities.StudySession;
import com.mentorship.entities.Transaction;
import com.mentorship.entities.User;
import com.mentorship.entities.VerificationStatus;
import com.mentorship.repository.FeedbackRepository;
import com.mentorship.repository.MentorAvailabilityRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.MentorStudentRepository;
import com.mentorship.repository.SessionPaymentRepository;
import com.mentorship.repository.SessionRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.repository.StudentSubscriptionRepository;
import com.mentorship.repository.StudySessionRepository;
import com.mentorship.repository.TransactionRepository;
import com.mentorship.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentServiceImpl.class);

    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    private final MentorAvailabilityRepository availabilityRepository;
    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final TransactionRepository transactionRepository;
    private final SessionPaymentRepository sessionPaymentRepository;
    private final StudentSubscriptionRepository studentSubscriptionRepository;
    private final StudySessionRepository studySessionRepository;
    private final MentorStudentRepository mentorStudentRepository;
    private final SessionService sessionService;
    private final EmailService emailService;

    private static final double PLATFORM_COMMISSION_RATE = 0.15;

    @Override
    public SessionDTO getNextSession(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        // Find upcoming sessions
        List<Session> upcomingSessions = sessionRepository.findUpcomingSessionsForStudent(student, today, currentTime);

        if (upcomingSessions.isEmpty()) {
            return null;
        }

        // Get the first (nearest) upcoming session
        Session nextSession = upcomingSessions.get(0);

        return nextSession != null ? convertToDTO(nextSession) : null;
    }

    @Override
    public List<SessionDTO> getUpcomingSessions(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        List<Session> upcomingSessions = sessionRepository.findUpcomingSessionsForStudent(student, today, currentTime);

        return upcomingSessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionDTO> getPastSessions(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        List<Session> pastSessions = sessionRepository.findPastSessionsForStudent(student, today, currentTime);

        return pastSessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DayAvailabilityDTO getMentorAvailableSlots(Long mentorId, LocalDate date) {
        // Get all availability slots for this mentor and date
        List<MentorAvailability> availabilities = availabilityRepository.findByMentor_MentorIdAndAvailableDate(mentorId,
                date);

        // Filter to only show available slots (not booked and not blocked)
        List<TimeSlotDTO> availableSlots = availabilities.stream()
                .filter(a -> a.getIsAvailable() && !a.getIsBooked() && !a.getIsBlocked())
                .map(this::convertToTimeSlotDTO)
                .collect(Collectors.toList());

        return DayAvailabilityDTO.builder()
                .date(date)
                .timeSlots(availableSlots)
                .build();
    }

    @Override
    public List<DayAvailabilityDTO> getMentorAvailableSlots(Long mentorId, LocalDate startDate, LocalDate endDate) {
        List<MentorAvailability> availabilities = availabilityRepository
                .findByMentorAndDateRange(mentorId, startDate, endDate);

        // Group by date and filter available slots
        return availabilities.stream()
                .filter(a -> a.getIsAvailable() && !a.getIsBooked() && !a.getIsBlocked())
                .collect(Collectors.groupingBy(MentorAvailability::getAvailableDate))
                .entrySet().stream()
                .map(entry -> DayAvailabilityDTO.builder()
                        .date(entry.getKey())
                        .timeSlots(entry.getValue().stream()
                                .map(this::convertToTimeSlotDTO)
                                .collect(Collectors.toList()))
                        .build())
                .sorted((d1, d2) -> d1.getDate().compareTo(d2.getDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionDTO> getAllSessions(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        List<Session> sessions = sessionRepository.findByStudent(student);

        return sessions.stream()
                .sorted((s1, s2) -> {
                    int dateCompare = s2.getSessionDate().compareTo(s1.getSessionDate());
                    if (dateCompare != 0)
                        return dateCompare;
                    return s2.getStartTime().compareTo(s1.getStartTime());
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SessionDTO convertToDTO(Session session) {
        return SessionDTO.builder()
                .sessionId(session.getSessionId())
                .mentorId(session.getMentor().getMentorId())
                .studentId(session.getStudent().getStudentId())
                .studentName(session.getStudent().getUserDetails().getFirstName() + " " +
                        session.getStudent().getUserDetails().getLastName())
                .sessionDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .topic(session.getTopic())
                .status(session.getStatus().toString())
                .cancelledBy(session.getCancelledBy())
                .cancellationReason(session.getCancellationReason())
                .cancelledAt(session.getCancelledAt())
                .sessionFee(session.getSessionFee())
                .notes(session.getNotes())
                .build();
    }

    private TimeSlotDTO convertToTimeSlotDTO(MentorAvailability availability) {
        LocalTime time = availability.getTimeSlot();
        String displayTime = String.format("%02d:%02d %s",
                time.getHour() > 12 ? time.getHour() - 12 : (time.getHour() == 0 ? 12 : time.getHour()),
                time.getMinute(),
                time.getHour() >= 12 ? "PM" : "AM");

        return TimeSlotDTO.builder()
                .timeSlot(time)
                .displayTime(displayTime)
                .available(availability.getIsAvailable())
                .booked(availability.getIsBooked())
                .blocked(availability.getIsBlocked())
                .build();
    }

    // ==========================================
    // ADDITIONAL STUDENT MANAGEMENT METHODS
    // ==========================================

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return mapToStudentDTO(student);
    }

    @Override
    public StudentDTO getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserDetails_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found for user id: " + userId));
        return mapToStudentDTO(student);
    }

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::mapToStudentDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO createStudent(StudentDTO dto) {
        Student student = new Student();
        student.setTargetDomain(dto.getTargetDomain());
        student.setQualification(dto.getQualification());
        student.setCollegeUniversity(dto.getCollegeUniversity());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        student.setUserDetails(user);
        studentRepository.save(student);
        return mapToStudentDTO(student);
    }

    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.getUserDetails().setEmail(dto.getEmail());
        student.getUserDetails().setFirstName(dto.getFirstName());
        student.getUserDetails().setLastName(dto.getLastName());
        student.setTargetDomain(dto.getTargetDomain());
        student.setQualification(dto.getQualification());
        student.setCollegeUniversity(dto.getCollegeUniversity());
        studentRepository.save(student);

        return mapToStudentDTO(student);
    }

    public void uploadProfileImage(Long studentId, byte[] imageBytes) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.getUserDetails().setImage(imageBytes);
        studentRepository.save(student);
    }

    public byte[] getProfileImage(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return student.getUserDetails().getImage();
    }

    @Override
    public void uploadResume(Long studentId, MultipartFile resume) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (resume.isEmpty()) {
            throw new RuntimeException("Resume file is empty");
        }

        String contentType = resume.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf")
                        && !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                        && !contentType.equals("application/msword"))) {
            throw new RuntimeException("Only PDF, DOC, or DOCX files are allowed");
        }

        try {
            student.setResume(resume.getBytes());
            student.setResumeFileName(resume.getOriginalFilename());
            student.setResumeContentType(resume.getContentType());
            studentRepository.save(student);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload resume: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadResume(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getResume() == null || student.getResume().length == 0) {
            throw new RuntimeException("Resume not found for this student");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        student.getResumeContentType() != null ? student.getResumeContentType() : "application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                (student.getResumeFileName() != null ? student.getResumeFileName() : "resume.pdf") +
                                "\"")
                .body(student.getResume());
    }

    public boolean deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            return false;
        }
        studentRepository.deleteById(id);
        return true;
    }

    private StudentDTO mapToStudentDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentId(student.getStudentId());
        if (student.getUserDetails() != null) {
            dto.setUserId(student.getUserDetails().getUserId());
            dto.setFirstName(student.getUserDetails().getFirstName());
            dto.setLastName(student.getUserDetails().getLastName());
            dto.setEmail(student.getUserDetails().getEmail());
        }
        dto.setTargetDomain(student.getTargetDomain());
        dto.setQualification(student.getQualification());
        dto.setCollegeUniversity(student.getCollegeUniversity());
        return dto;
    }

    // ==========================================
    // MENTOR BROWSING & SUBSCRIPTION METHODS
    // ==========================================

    public List<MentorDTO> getVerifiedMentors(Long studentId, String domain) {
        try {
            Student student = studentRepository.findById(studentId)
                    .or(() -> studentRepository.findByUserDetails_UserId(studentId))
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            /*
             * boolean hasActiveSubscription = !studentSubscriptionRepository
             * .findActiveSubscription(studentId)
             * .isEmpty();
             * 
             * if (!hasActiveSubscription) {
             * throw new
             * RuntimeException("Active subscription required to browse mentors.");
             * }
             */

            List<Mentor> mentors;
            if (domain == null || domain.isEmpty()) {
                mentors = mentorRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
            } else {
                mentors = mentorRepository.findByVerificationStatusAndDomainContainingIgnoreCase(
                        VerificationStatus.VERIFIED, domain);
            }

            return mentors.stream().map(m -> {
                MentorDTO dto = new MentorDTO();
                if (m.getUserDetails() != null) {
                    dto.setUserId(m.getUserDetails().getUserId());
                }
                dto.setMentorId(m.getMentorId());
                dto.setName(m.getUserDetails().getFirstName() + " " + m.getUserDetails().getLastName());
                dto.setSpecialization(m.getSpecialization());
                dto.setCustomSpecialization(m.getCustomSpecialization());
                dto.setRatePerSession(m.getRatePerSession());
                dto.setDiscountPercent(m.getDiscountPercent());
                double finalPriceList = m.getRatePerSession() - (m.getRatePerSession() * m.getDiscountPercent() / 100.0);
                dto.setFinalPrice((double) Math.round(finalPriceList));
                dto.setEmail(m.getUserDetails().getEmail());
                dto.setExperience(m.getExperience());
                dto.setAbout(m.getCustomSpecialization() != null && !m.getCustomSpecialization().isEmpty()
                        ? m.getCustomSpecialization()
                        : m.getSpecialization());
                dto.setExpertise(m.getCustomSpecialization() != null && !m.getCustomSpecialization().isEmpty()
                        ? m.getCustomSpecialization()
                        : m.getSpecialization());
                dto.setLinkedinUrl(m.getLinkedinUrl());
                dto.setGithubUrl(m.getGithubUrl());
                dto.setTwitterUrl(m.getTwitterUrl());
                dto.setPortfolioUrl(m.getPortfolioUrl());
                if (m.getVerificationStatus() != null) {
                    dto.setVerificationStatus(m.getVerificationStatus().name());
                } else {
                    dto.setVerificationStatus("PENDING");
                }
                return dto;
            }).toList();

        } catch (Exception e) {
            throw e;
        }
    }

    public StudentSubscription getActiveSubscription(Long studentId) {
        List<StudentSubscription> subs = studentSubscriptionRepository.findActiveSubscription(studentId);
        if (subs.isEmpty()) {
            return null;
        }
        return subs.get(0);
    }

    public StudentSubscription saveSubscription(StudentSubscription sub) {
        return studentSubscriptionRepository.save(sub);
    }

    public MentorDTO getMentorDetails(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        MentorDTO dto = new MentorDTO();
        if (mentor.getUserDetails() != null) {
            dto.setUserId(mentor.getUserDetails().getUserId());
        }
        dto.setMentorId(mentor.getMentorId());
        dto.setName(mentor.getUserDetails().getFirstName() + " " + mentor.getUserDetails().getLastName());
        dto.setSpecialization(mentor.getSpecialization());
        dto.setRatePerSession(mentor.getRatePerSession());
        dto.setDiscountPercent(mentor.getDiscountPercent());
        double finalPrice = mentor.getRatePerSession() - (mentor.getRatePerSession() * mentor.getDiscountPercent() / 100.0);
        dto.setFinalPrice((double) Math.round(finalPrice));
        dto.setEmail(mentor.getUserDetails().getEmail());
        dto.setExperience(mentor.getExperience());
        dto.setAbout(mentor.getSpecialization());
        dto.setExpertise(mentor.getSpecialization());
        dto.setLinkedinUrl(mentor.getLinkedinUrl());
        dto.setGithubUrl(mentor.getGithubUrl());
        dto.setTwitterUrl(mentor.getTwitterUrl());
        dto.setPortfolioUrl(mentor.getPortfolioUrl());

        return dto;
    }

    // ==========================================
    // SESSION BOOKING & PAYMENT METHODS
    // ==========================================

    public StudentSessionDTO bookSession(Long studentId, StudentSessionDTO dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Validate that the requested date and time slot is available
        LocalDate sessionDate = dto.getSessionDate();
        LocalTime startTime = dto.getStartTime();

        if (sessionDate == null || startTime == null) {
            throw new RuntimeException("Session date and start time are required");
        }

        // Check if mentor has marked this time slot as available
        MentorAvailability availability = availabilityRepository
                .findByMentor_MentorIdAndAvailableDateAndTimeSlot(mentor.getMentorId(), sessionDate, startTime)
                .orElseThrow(() -> new RuntimeException(
                        "This time slot is not available. Please choose from mentor's available slots."));

        // Check if the slot is available and not already booked
        if (!availability.getIsAvailable() || availability.getIsBooked() || availability.getIsBlocked()) {
            throw new RuntimeException("This time slot is not available for booking. Please choose another slot.");
        }

        // Automatically calculate end time as 1 hour from start time
        LocalTime endTime = startTime.plusHours(1);

        // Create or update mentor-student relationship
        if (!mentorStudentRepository.existsByMentor_MentorIdAndStudent_StudentId(mentor.getMentorId(), studentId)) {
            MentorStudent mentorStudent = new MentorStudent();
            mentorStudent.setMentor(mentor);
            mentorStudent.setStudent(student);
            mentorStudent.setEnrollmentDate(LocalDate.now());
            mentorStudent.setStatus(MentorStudentStatus.ACTIVE);
            mentorStudent.setTotalSessions(0);
            mentorStudent.setProgressPercentage(0);
            mentorStudentRepository.save(mentorStudent);
        }

        Session session = new Session();
        session.setStudent(student);
        session.setMentor(mentor);
        session.setSessionDate(sessionDate);
        session.setStartTime(startTime);
        session.setEndTime(endTime); // Automatically set to 1 hour duration
        session.setTopic(dto.getTopic());
        session.setDescription(dto.getDescription());
        session.setStatus(SessionStatus.PAYMENT_PENDING);
        double mentorRate = mentor.getRatePerSession();
        double mentorDisc = mentor.getDiscountPercent();
        double feeToCharge = mentorRate - (mentorRate * mentorDisc / 100.0);
        session.setSessionFee(feeToCharge);
        sessionRepository.save(session);

        // Mark the availability slot as booked
        availability.setIsBooked(true);
        availability.setIsAvailable(false);
        availabilityRepository.save(availability);

        try {
            emailService.sendSessionBookingConfirmationEmail(
                    student.getUserDetails().getEmail(),
                    student.getUserDetails().getFirstName() + " " + student.getUserDetails().getLastName(),
                    mentor.getUserDetails().getFirstName() + " " + mentor.getUserDetails().getLastName(),
                    sessionDate.toString(),
                    startTime.toString(),
                    dto.getTopic());

            emailService.sendSessionBookingNotificationToMentor(
                    mentor.getUserDetails().getEmail(),
                    student.getUserDetails().getFirstName() + " " + student.getUserDetails().getLastName(),
                    sessionDate.toString(),
                    startTime.toString(),
                    dto.getTopic());
        } catch (Exception e) {
            log.error("Failed to send booking notification emails: {}", e.getMessage(), e);
        }

        dto.setSessionId(session.getSessionId());
        dto.setEndTime(endTime); // Return the calculated end time
        dto.setSessionFee(feeToCharge);
        return dto;
    }

    public void processSessionPayment(SessionPaymentNotificationDTO dto) {
        Session session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if ("SUCCESS".equalsIgnoreCase(dto.getStatus())) {
            session.setStatus(SessionStatus.SCHEDULED);
            sessionRepository.save(session);

            double totalAmount = dto.getAmount() != null ? dto.getAmount() : session.getSessionFee();
            double platformCut = roundToTwoDecimals(totalAmount * PLATFORM_COMMISSION_RATE);
            double mentorAmount = roundToTwoDecimals(totalAmount - platformCut);

            // Create SessionPayment record
            SessionPayment payment = new SessionPayment();
            payment.setSession(session);
            payment.setStudent(session.getStudent());
            payment.setMentor(session.getMentor());
            payment.setTransactionId(dto.getTransactionId());
            payment.setAmount(totalAmount);
            payment.setMentorAmount(mentorAmount);
            payment.setPlatformCut(platformCut);
            payment.setPaymentTime(LocalDateTime.now());
            payment.setStatus(dto.getStatus());
            sessionPaymentRepository.save(payment);

            // Create Transaction record for earnings tracking
            Transaction transaction = new Transaction();
            transaction.setMentor(session.getMentor());
            transaction.setStudent(session.getStudent());
            transaction.setSession(session);
            transaction.setAmount(totalAmount);
            transaction.setMentorAmount(mentorAmount);
            transaction.setPlatformCut(platformCut);
            transaction.setTransactionDate(LocalDate.now());
            transaction.setPaymentStatus(PaymentStatus.COMPLETED);
            transaction.setPaymentMethod(PaymentMethod.UPI);
            transaction.setTransactionReference(dto.getTransactionId());
            transaction.setDescription(
                    "Payment for session on " + session.getSessionDate() + " at " + session.getStartTime());
            transactionRepository.save(transaction);

            try {
                emailService.sendSessionPaymentStatusEmail(
                        session.getStudent().getUserDetails().getEmail(),
                        session.getStudent().getUserDetails().getFirstName() + " " + session.getStudent().getUserDetails().getLastName(),
                        session.getMentor().getUserDetails().getFirstName() + " " + session.getMentor().getUserDetails().getLastName(),
                        session.getSessionDate().toString(),
                        session.getStartTime().toString(),
                        dto.getAmount(),
                        dto.getStatus());

                emailService.sendSessionPaymentStatusEmail(
                        session.getMentor().getUserDetails().getEmail(),
                        session.getMentor().getUserDetails().getFirstName() + " " + session.getMentor().getUserDetails().getLastName(),
                        session.getStudent().getUserDetails().getFirstName() + " " + session.getStudent().getUserDetails().getLastName(),
                        session.getSessionDate().toString(),
                        session.getStartTime().toString(),
                        dto.getAmount(),
                        dto.getStatus());
            } catch (Exception e) {
                log.error("Failed to send payment notification emails: {}", e.getMessage(), e);
            }
        } else {
            session.setStatus(SessionStatus.PAYMENT_FAILED);
            sessionRepository.save(session);

            try {
                emailService.sendSessionPaymentStatusEmail(
                        session.getStudent().getUserDetails().getEmail(),
                        session.getStudent().getUserDetails().getFirstName() + " " + session.getStudent().getUserDetails().getLastName(),
                        session.getMentor().getUserDetails().getFirstName() + " " + session.getMentor().getUserDetails().getLastName(),
                        session.getSessionDate().toString(),
                        session.getStartTime().toString(),
                        dto.getAmount(),
                        dto.getStatus());
            } catch (Exception e) {
                log.error("Failed to send payment failure email: {}", e.getMessage(), e);
            }
        }
    }

    private double roundToTwoDecimals(Double value) {
        return value == null ? 0.0 : Math.round(value * 100.0) / 100.0;
    }

    public List<StudentSessionResponseDTO> getStudentSessions(Long studentId) {
        // Auto-complete expired sessions using centralized logic
        sessionService.updateExpiredSessions();

        List<Session> sessions = sessionRepository.findByStudent_StudentId(studentId);

        return sessions.stream().map(s -> {
            StudentSessionResponseDTO dto = new StudentSessionResponseDTO();
            dto.setSessionId(s.getSessionId());
            dto.setMentorId(s.getMentor().getMentorId());
            dto.setMentorUserId(s.getMentor().getUserDetails().getUserId()); // Add mentor's userId for chat
            dto.setMentorName(
                    s.getMentor().getUserDetails().getFirstName() + " " +
                            s.getMentor().getUserDetails().getLastName());
            dto.setSessionDate(s.getSessionDate());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setTopic(s.getTopic());
            dto.setDescription(s.getDescription());
            dto.setStatus(s.getStatus().name());
            dto.setSessionFee(s.getSessionFee());
            return dto;
        }).toList();
    }

    public StudentDashboardDTO getStudentDashboard(Long studentId) {
        StudentDashboardDTO dto = new StudentDashboardDTO();
        dto.setTotalSessions(sessionRepository.countTotalSessions(studentId));
        dto.setUpcomingSessions(sessionRepository.countUpcomingSessions(studentId));
        dto.setCompletedSessions(sessionRepository.countCompletedSessions(studentId));
        dto.setTotalSpent(sessionRepository.sumTotalSpent(studentId));
        return dto;
    }

    public void cancelSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() == SessionStatus.COMPLETED
                || session.getStatus() == SessionStatus.CANCELLED_BY_STUDENT
                || session.getStatus() == SessionStatus.CANCELLED_BY_MENTOR) {
            throw new RuntimeException("Session cannot be cancelled");
        }

        // Release the booked time slot back to available
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

        session.setStatus(SessionStatus.CANCELLED_BY_STUDENT);
        session.setCancelledBy("STUDENT");
        session.setCancellationReason("Cancelled by student");
        session.setCancelledAt(LocalDateTime.now());
        sessionRepository.save(session);

        List<SessionPayment> payments = sessionPaymentRepository.findBySession_SessionId(sessionId);
        for (SessionPayment payment : payments) {
            if ("SUCCESS".equalsIgnoreCase(payment.getStatus()) &&
                    (payment.getRefundStatus() == null || !payment.getRefundStatus().equalsIgnoreCase("COMPLETED"))) {
                payment.setRefundStatus("COMPLETED");
                payment.setRefundAmount(payment.getAmount());
                payment.setRefundDate(LocalDateTime.now());
                payment.setRefundReason("Cancelled by student");
                sessionPaymentRepository.save(payment);
            }
        }

        List<Transaction> transactions = transactionRepository.findAllBySessionSessionId(sessionId);
        for (Transaction transaction : transactions) {
            if (transaction.getPaymentStatus() == PaymentStatus.COMPLETED) {
                transaction.setPaymentStatus(PaymentStatus.REFUNDED);
                transaction.setDescription("Session cancelled by student and refunded");
                transactionRepository.save(transaction);
            }
        }
    }

    public void deleteSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.SCHEDULED) {
            throw new RuntimeException("Only pending or cancelled sessions may be deleted. Cancel the session first if it is scheduled.");
        }

        // Release the booked time slot back to available when deleting a pending or cancelled session
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

        // Removing the session must happen after any dependent transaction/payment
        // records are cleaned up, otherwise the FK constraints on payment and
        // feedback tables will fail.
        List<SessionPayment> payments = sessionPaymentRepository.findBySession_SessionId(sessionId);
        if (!payments.isEmpty()) {
            sessionPaymentRepository.deleteAll(payments);
        }

        List<Transaction> transactions = transactionRepository.findAllBySessionSessionId(sessionId);
        if (!transactions.isEmpty()) {
            transactionRepository.deleteAll(transactions);
        }

        List<Feedback> feedbacks = feedbackRepository.findBySession_SessionId(sessionId);
        if (!feedbacks.isEmpty()) {
            feedbackRepository.deleteAll(feedbacks);
        }

        sessionRepository.delete(session);
    }

    // ==========================================
    // FEEDBACK METHODS
    // ==========================================

    public FeedbackResponseDTO giveFeedback(Long studentId, FeedbackRequestDTO dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        Session session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new RuntimeException("Feedback allowed only after session completion");
        }

        Feedback feedback = new Feedback();
        feedback.setStudent(student);
        feedback.setMentor(mentor);
        feedback.setSession(session);
        feedback.setRating(dto.getRating());
        feedback.setMessage(dto.getMessage());
        feedback.setFeedbackDate(LocalDate.now());

        feedbackRepository.save(feedback);

        FeedbackResponseDTO res = new FeedbackResponseDTO();
        res.setFeedbackId(feedback.getFeedbackId());
        res.setStudentId(studentId);
        res.setMentorId(dto.getMentorId());
        res.setSessionId(dto.getSessionId());
        res.setRating(dto.getRating());
        res.setMessage(dto.getMessage());
        res.setFeedbackDate(feedback.getFeedbackDate());

        return res;
    }

    public List<FeedbackResponseDTO> getStudentFeedbacks(Long studentId) {
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getStudent().getStudentId().equals(studentId))
                .map(f -> {
                    FeedbackResponseDTO dto = new FeedbackResponseDTO();
                    dto.setFeedbackId(f.getFeedbackId());
                    dto.setMentorId(f.getMentor().getMentorId());
                    dto.setStudentId(f.getStudent().getStudentId());
                    dto.setSessionId(f.getSession().getSessionId());
                    dto.setRating(f.getRating());
                    dto.setMessage(f.getMessage());
                    dto.setFeedbackDate(f.getFeedbackDate());
                    return dto;
                }).toList();
    }

    // ==========================================
    // STUDY TIMER METHODS
    // ==========================================

    public StudySession startStudySession(Long studentId, String taskName) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudySession session = new StudySession();
        session.setStudent(student);
        session.setTaskName(taskName);
        session.setStartTime(LocalDateTime.now());
        session.setStatus(StudySession.StudyStatus.ONGOING);

        return studySessionRepository.save(session);
    }

    public StudySession stopStudySession(Long sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Study Session not found"));

        if (session.getStatus() == StudySession.StudyStatus.COMPLETED) {
            throw new RuntimeException("Session already completed");
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(StudySession.StudyStatus.COMPLETED);

        long minutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        session.setDurationMinutes(minutes);

        return studySessionRepository.save(session);
    }

    public void deleteStudySession(Long sessionId) {
        if (!studySessionRepository.existsById(sessionId)) {
            throw new RuntimeException("Study Session not found");
        }
        studySessionRepository.deleteById(sessionId);
    }

    public List<StudySession> getStudyHistory(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<StudySession> sessions = studySessionRepository.findByStudent(student);
        sessions.sort((a, b) -> b.getStartTime().compareTo(a.getStartTime()));

        return sessions;
    }

}
