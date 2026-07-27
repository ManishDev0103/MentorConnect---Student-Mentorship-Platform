package com.mentorship.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.StudentCardDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.MentorStudent;
import com.mentorship.entities.MentorStudentStatus;
import com.mentorship.entities.Session;
import com.mentorship.entities.SessionStatus;
import com.mentorship.entities.Student;
import com.mentorship.repository.MCQPracticeSessionRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.MentorStudentRepository;
import com.mentorship.repository.SessionRepository;
import com.mentorship.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MyStudentsServiceImpl implements MyStudentsService {

    private final MentorStudentRepository mentorStudentRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;
    private final MCQPracticeSessionRepository sessionRepository;
    private final SessionRepository actualSessionRepository;

    @Override
    public Long getMentorIdByUserId(Long userId) {
        Mentor mentor = mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor not found for userId: " + userId));
        return mentor.getMentorId();
    }

    @Override
    public List<StudentCardDTO> getAllStudents(Long mentorId) {
        List<MentorStudent> mentorStudents = mentorStudentRepository.findByMentor_MentorId(mentorId);
        return mentorStudents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentCardDTO> getActiveStudents(Long mentorId) {
        List<MentorStudent> mentorStudents = mentorStudentRepository
                .findByMentor_MentorIdAndStatus(mentorId, MentorStudentStatus.ACTIVE);
        return mentorStudents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StudentCardDTO getStudentDetails(Long mentorId, Long studentId) {
        MentorStudent mentorStudent = mentorStudentRepository
                .findByMentor_MentorIdAndStudent_StudentId(mentorId, studentId)
                .orElseThrow(() -> new RuntimeException("Student relationship not found"));
        return convertToDTO(mentorStudent);
    }

    @Override
    public void updateStudentProgress(Long mentorId, Long studentId, Integer progress) {
        MentorStudent mentorStudent = mentorStudentRepository
                .findByMentor_MentorIdAndStudent_StudentId(mentorId, studentId)
                .orElseThrow(() -> new RuntimeException("Student relationship not found"));
        
        mentorStudent.setProgressPercentage(progress);
        mentorStudentRepository.save(mentorStudent);
    }

    @Override
    public StudentCardDTO addStudent(Long mentorId, Long studentId) {
        // Check if relationship already exists
        if (mentorStudentRepository.existsByMentor_MentorIdAndStudent_StudentId(mentorId, studentId)) {
            throw new RuntimeException("Student is already assigned to this mentor");
        }

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        MentorStudent mentorStudent = new MentorStudent();
        mentorStudent.setMentor(mentor);
        mentorStudent.setStudent(student);
        mentorStudent.setEnrollmentDate(LocalDate.now());
        mentorStudent.setStatus(MentorStudentStatus.ACTIVE);
        mentorStudent.setTotalSessions(0);
        mentorStudent.setProgressPercentage(0);

        MentorStudent saved = mentorStudentRepository.save(mentorStudent);
        return convertToDTO(saved);
    }

    @Override
    public void removeStudent(Long mentorId, Long studentId) {
        MentorStudent mentorStudent = mentorStudentRepository
                .findByMentor_MentorIdAndStudent_StudentId(mentorId, studentId)
                .orElseThrow(() -> new RuntimeException("Student relationship not found"));
        
        mentorStudent.setStatus(MentorStudentStatus.INACTIVE);
        mentorStudentRepository.save(mentorStudent);
    }

    @Override
    public Integer countActiveStudents(Long mentorId) {
        return mentorStudentRepository.countActiveStudents(mentorId);
    }

    private StudentCardDTO convertToDTO(MentorStudent ms) {
        String firstName = ms.getStudent().getUserDetails().getFirstName();
        String lastName = ms.getStudent().getUserDetails().getLastName();
        String fullName = firstName + " " + lastName;
        
        // Safely create initials, handling null or empty names
        String initials = "";
        if (firstName != null && !firstName.isEmpty()) {
            initials += firstName.substring(0, 1).toUpperCase();
        }
        if (lastName != null && !lastName.isEmpty()) {
            initials += lastName.substring(0, 1).toUpperCase();
        }
        if (initials.isEmpty()) {
            initials = "??"; // Default if no names available
        }
        
        // Get the next scheduled session for this student with this mentor
        String nextSession = getNextScheduledSession(ms.getMentor().getMentorId(), ms.getStudent().getStudentId());
        
        // Calculate MCQ-based progress
        int mcqProgress = calculateMCQProgress(ms.getMentor().getMentorId(), ms.getStudent().getStudentId());

        // Dynamically count actual sessions from database
        Integer actualSessionCount = actualSessionRepository.countSessionsByMentorAndStudent(
            ms.getMentor().getMentorId(), 
            ms.getStudent().getStudentId()
        );

        return StudentCardDTO.builder()
                .studentId(ms.getStudent().getStudentId())
                .name(fullName)
                .initials(initials)
                .sessions(actualSessionCount != null ? actualSessionCount : 0)
                .progress(mcqProgress)
                .nextSession(nextSession)
                .email(ms.getStudent().getUserDetails().getEmail())
                .targetDomain(ms.getStudent().getTargetDomain())
                .status(ms.getStatus().name())
                .build();
    }
    
    private int calculateMCQProgress(Long mentorId, Long studentId) {
        // Get total practice sessions for this student (max 10)
        long totalSessions = sessionRepository.countByMentorIdAndStudentId(mentorId, studentId);
        
        if (totalSessions == 0) {
            return 0;
        }
        
        // Get completed sessions count
        long completedSessions = sessionRepository.countCompletedSessions(studentId);
        
        // Calculate progress: each completed session is worth 10% (10 sessions x 10 = 100%)
        int progress = (int) ((completedSessions * 100) / 10);
        
        return Math.min(progress, 100); // Cap at 100%
    }
    
    private String getNextScheduledSession(Long mentorId, Long studentId) {
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        // Find all scheduled sessions for this student with this mentor
        List<Session> sessions = actualSessionRepository.findByMentor_MentorIdAndStudent_StudentId(mentorId, studentId);
        
        // Filter for upcoming scheduled sessions
        Session nextSession = sessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
                .filter(s -> s.getSessionDate().isAfter(today) || 
                           (s.getSessionDate().isEqual(today) && s.getStartTime().isAfter(currentTime)))
                .sorted((s1, s2) -> {
                    int dateCompare = s1.getSessionDate().compareTo(s2.getSessionDate());
                    if (dateCompare != 0) return dateCompare;
                    return s1.getStartTime().compareTo(s2.getStartTime());
                })
                .findFirst()
                .orElse(null);
        
        if (nextSession == null) {
            return "No upcoming session";
        }
        
        // Format: "Jan 15, 2:30 PM"
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM d");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
        
        String formattedDate = nextSession.getSessionDate().format(dateFormatter);
        String formattedTime = nextSession.getStartTime().format(timeFormatter);
        
        return formattedDate + ", " + formattedTime;
    }
}

