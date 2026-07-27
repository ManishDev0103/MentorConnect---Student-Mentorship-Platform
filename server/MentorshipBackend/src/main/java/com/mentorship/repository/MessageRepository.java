package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find all messages between a mentor and student, ordered by time
    @Query("SELECT m FROM Message m WHERE " +
           "(m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("mentorId") Long mentorId, 
                                   @Param("studentId") Long studentId);
    
    // Find unread messages for a mentor from a specific student
    @Query("SELECT m FROM Message m WHERE " +
           "m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId " +
           "AND m.isRead = false AND m.senderType = 'STUDENT' " +
           "ORDER BY m.sentAt ASC")
    List<Message> findUnreadMessagesForMentor(@Param("mentorId") Long mentorId, 
                                              @Param("studentId") Long studentId);
    
    // Count unread messages for mentor from a student
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId " +
           "AND m.isRead = false AND m.senderType = 'STUDENT'")
    Long countUnreadMessagesForMentor(@Param("mentorId") Long mentorId, 
                                      @Param("studentId") Long studentId);
    
    // Mark messages as read (for mentor - marks STUDENT messages as read)
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId " +
           "AND m.senderType = 'STUDENT' AND m.isRead = false")
    void markMessagesAsRead(@Param("mentorId") Long mentorId, 
                           @Param("studentId") Long studentId);
    
    // Mark messages as read (for student - marks MENTOR messages as read)
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId " +
           "AND m.senderType = 'MENTOR' AND m.isRead = false")
    void markMentorMessagesAsReadForStudent(@Param("mentorId") Long mentorId, 
                                            @Param("studentId") Long studentId);
    
    // Get all students who have chatted with this mentor
    @Query("SELECT DISTINCT m.student.studentId FROM Message m WHERE m.mentor.mentorId = :mentorId " +
           "ORDER BY (SELECT MAX(msg.sentAt) FROM Message msg WHERE msg.mentor.mentorId = :mentorId " +
           "AND msg.student.studentId = m.student.studentId) DESC")
    List<Long> findStudentIdsChattedWithMentor(@Param("mentorId") Long mentorId);
    
    // Get all mentors who have chatted with this student
    @Query("SELECT DISTINCT m.mentor.mentorId FROM Message m WHERE m.student.studentId = :studentId " +
           "ORDER BY (SELECT MAX(msg.sentAt) FROM Message msg WHERE msg.student.studentId = :studentId " +
           "AND msg.mentor.mentorId = m.mentor.mentorId) DESC")
    List<Long> findMentorIdsChattedWithStudent(@Param("studentId") Long studentId);
    
    // Count unread messages for student from a mentor
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.mentor.mentorId = :mentorId AND m.student.studentId = :studentId " +
           "AND m.isRead = false AND m.senderType = 'MENTOR'")
    Long countUnreadMessagesForStudent(@Param("mentorId") Long mentorId, 
                                       @Param("studentId") Long studentId);
}
