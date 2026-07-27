package com.mentorship.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.DashboardStatsDTO;
import com.mentorship.dtos.SessionDTO;
import com.mentorship.dtos.StudentCardDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.MentorStudent;
import com.mentorship.entities.Session;
import com.mentorship.entities.User;
import com.mentorship.repository.FeedbackRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.MentorStudentRepository;
import com.mentorship.repository.SessionRepository;
import com.mentorship.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MentorDashboardServiceImpl implements MentorDashboardService {

    private final MentorRepository mentorRepository;
    private final SessionRepository sessionRepository;
    private final MentorStudentRepository mentorStudentRepository;
    private final FeedbackRepository feedbackRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public DashboardStatsDTO getDashboardStats(Long mentorId) {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        Integer activeStudents = mentorStudentRepository.countActiveStudents(mentorId);
        Integer totalSessions = sessionRepository.countTotalSessionsByMentor(mentorId);
        Double totalEarnings = transactionRepository.calculateTotalEarnings(mentorId);
        Double thisMonthEarnings = transactionRepository.calculateMonthlyEarnings(mentorId, currentYear, currentMonth);
        Double averageRating = feedbackRepository.calculateAverageRating(mentorId);
        Integer completedSessions = sessionRepository.countCompletedSessionsByMentor(mentorId);
        Integer upcomingSessions = sessionRepository.countUpcomingSessionsByMentor(mentorId, today);

        return DashboardStatsDTO.builder()
                .activeStudents(activeStudents != null ? activeStudents : 0)
                .totalSessions(totalSessions != null ? totalSessions : 0)
                .totalEarnings(totalEarnings != null ? totalEarnings : 0.0)
                .thisMonthEarnings(thisMonthEarnings != null ? thisMonthEarnings : 0.0)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .completedSessions(completedSessions != null ? completedSessions : 0)
                .upcomingSessions(upcomingSessions != null ? upcomingSessions : 0)
                .build();
    }

    @Override
    public List<SessionDTO> getTodaysSessions(Long mentorId) {
        LocalDate today = LocalDate.now();
        List<Session> sessions = sessionRepository.findTodaysSessions(mentorId, today);
        
        return sessions.stream()
                .map(this::convertToSessionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentCardDTO> getAssignedStudentsSummary(Long mentorId) {
        List<MentorStudent> mentorStudents = mentorStudentRepository.findStudentsWithDetails(mentorId);
        
        return mentorStudents.stream()
                .map(this::convertToStudentCardDTO)
                .collect(Collectors.toList());
    }

    private SessionDTO convertToSessionDTO(Session session) {
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
                .sessionFee(session.getSessionFee())
                .notes(session.getNotes())
                .build();
    }

    private StudentCardDTO convertToStudentCardDTO(MentorStudent ms) {
        String firstName = ms.getStudent().getUserDetails().getFirstName();
        String lastName = ms.getStudent().getUserDetails().getLastName();
        String fullName = firstName + " " + lastName;
        String initials = (firstName.substring(0, 1) + lastName.substring(0, 1)).toUpperCase();
        
        String nextSession = null;
        if (ms.getNextSessionDate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d");
            nextSession = ms.getNextSessionDate().format(formatter);
            if (ms.getNextSessionTime() != null) {
                nextSession += ", " + ms.getNextSessionTime();
            }
        }

        // Dynamically count sessions from database
        Integer actualSessionCount = sessionRepository.countSessionsByMentorAndStudent(
            ms.getMentor().getMentorId(), 
            ms.getStudent().getStudentId()
        );

        return StudentCardDTO.builder()
                .studentId(ms.getStudent().getStudentId())
                .name(fullName)
                .initials(initials)
                .sessions(actualSessionCount != null ? actualSessionCount : 0)
                .progress(ms.getProgressPercentage())
                .nextSession(nextSession)
                .email(ms.getStudent().getUserDetails().getEmail())
                .targetDomain(ms.getStudent().getTargetDomain())
                .status(ms.getStatus().name())
                .build();
    }
}
