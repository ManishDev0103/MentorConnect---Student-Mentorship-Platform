package com.mentorship.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.MentorStudent;
import com.mentorship.entities.MentorStudentStatus;

@Repository
public interface MentorStudentRepository extends JpaRepository<MentorStudent, Long> {

    // Find all students for a mentor
    List<MentorStudent> findByMentor_MentorId(Long mentorId);

    // Find active students for a mentor
    List<MentorStudent> findByMentor_MentorIdAndStatus(Long mentorId, MentorStudentStatus status);

    // Count active students for a mentor
    @Query("SELECT COUNT(ms) FROM MentorStudent ms WHERE ms.mentor.mentorId = :mentorId AND ms.status = 'ACTIVE'")
    Integer countActiveStudents(@Param("mentorId") Long mentorId);

    // Find specific mentor-student relationship
    Optional<MentorStudent> findByMentor_MentorIdAndStudent_StudentId(Long mentorId, Long studentId);

    // Check if relationship exists
    boolean existsByMentor_MentorIdAndStudent_StudentId(Long mentorId, Long studentId);

    // Find students with their session count
    @Query("SELECT ms FROM MentorStudent ms WHERE ms.mentor.mentorId = :mentorId ORDER BY ms.enrollmentDate DESC")
    List<MentorStudent> findStudentsWithDetails(@Param("mentorId") Long mentorId);
}
