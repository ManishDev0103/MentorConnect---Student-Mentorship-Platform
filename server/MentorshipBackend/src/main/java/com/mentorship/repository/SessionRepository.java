package com.mentorship.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.Session;
import com.mentorship.entities.SessionStatus;
import com.mentorship.entities.Student;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    // Find sessions by mentor ID
    List<Session> findByMentor_MentorId(Long mentorId);

    // Find sessions by mentor ID and date
    List<Session> findByMentor_MentorIdAndSessionDate(Long mentorId, LocalDate sessionDate);

    // Find sessions by mentor ID and status
    List<Session> findByMentor_MentorIdAndStatus(Long mentorId, SessionStatus status);
    
    // Find sessions by status (for all mentors)
    List<Session> findByStatus(SessionStatus status);

    // Find today's sessions for a mentor
    @Query("SELECT s FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.sessionDate = :today ORDER BY s.startTime")
    List<Session> findTodaysSessions(@Param("mentorId") Long mentorId, @Param("today") LocalDate today);

    // Find upcoming sessions for a mentor
    @Query("SELECT s FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.sessionDate >= :today AND s.status = 'SCHEDULED' ORDER BY s.sessionDate, s.startTime")
    List<Session> findUpcomingSessions(@Param("mentorId") Long mentorId, @Param("today") LocalDate today);

    // Count total sessions for a mentor
    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.mentorId = :mentorId")
    Integer countTotalSessionsByMentor(@Param("mentorId") Long mentorId);

    // Count completed sessions for a mentor
    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.status = 'COMPLETED'")
    Integer countCompletedSessionsByMentor(@Param("mentorId") Long mentorId);

    // Count upcoming sessions for a mentor
    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.sessionDate >= :today AND s.status = 'SCHEDULED'")
    Integer countUpcomingSessionsByMentor(@Param("mentorId") Long mentorId, @Param("today") LocalDate today);

    // Find sessions between dates for a mentor
    @Query("SELECT s FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.sessionDate BETWEEN :startDate AND :endDate ORDER BY s.sessionDate, s.startTime")
    List<Session> findSessionsBetweenDates(@Param("mentorId") Long mentorId, 
                                            @Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);

    // Find sessions by student and mentor
    List<Session> findByMentor_MentorIdAndStudent_StudentId(Long mentorId, Long studentId);

    // Count sessions by mentor and student
    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.mentorId = :mentorId AND s.student.studentId = :studentId")
    Integer countSessionsByMentorAndStudent(@Param("mentorId") Long mentorId, @Param("studentId") Long studentId);
    
    // Student-specific queries
    // Find all sessions for a student
    List<Session> findByStudent(Student student);
    
    // Find upcoming sessions for a student (after current date or after today with later time)
    @Query("SELECT s FROM Session s WHERE s.student = :student AND " +
           "(s.sessionDate > :today OR (s.sessionDate = :today AND s.startTime > :currentTime)) " +
           "ORDER BY s.sessionDate, s.startTime")
    List<Session> findUpcomingSessionsForStudent(@Param("student") Student student, 
                                                  @Param("today") LocalDate today, 
                                                  @Param("currentTime") LocalTime currentTime);
    
    // Find past sessions for a student (before current date or today with earlier time)
    @Query("SELECT s FROM Session s WHERE s.student = :student AND " +
           "(s.sessionDate < :today OR (s.sessionDate = :today AND s.startTime < :currentTime)) " +
           "ORDER BY s.sessionDate DESC, s.startTime DESC")
    List<Session> findPastSessionsForStudent(@Param("student") Student student, 
                                             @Param("today") LocalDate today, 
                                             @Param("currentTime") LocalTime currentTime);
    
    // Find sessions by student ID
    List<Session> findByStudent_StudentId(Long studentId);
    
    // Count total sessions for a student
    @Query("SELECT COUNT(s) FROM Session s WHERE s.student.studentId = :studentId")
    Long countTotalSessions(@Param("studentId") Long studentId);
    
    // Count upcoming sessions for a student
    @Query("SELECT COUNT(s) FROM Session s WHERE s.student.studentId = :studentId AND s.sessionDate >= CURRENT_DATE AND s.status = 'SCHEDULED'")
    Long countUpcomingSessions(@Param("studentId") Long studentId);
    
    // Count completed sessions for a student
    @Query("SELECT COUNT(s) FROM Session s WHERE s.student.studentId = :studentId AND s.status = 'COMPLETED'")
    Long countCompletedSessions(@Param("studentId") Long studentId);
    
    // Sum total amount spent by student
    @Query("SELECT COALESCE(SUM(s.sessionFee), 0.0) FROM Session s WHERE s.student.studentId = :studentId")
    Double sumTotalSpent(@Param("studentId") Long studentId);
}