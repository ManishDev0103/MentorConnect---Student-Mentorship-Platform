package com.mentorship.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mentorship.entities.Mentor;
import com.mentorship.entities.VerificationStatus;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
    
    @Query("SELECT m FROM Mentor m WHERE m.userDetails.userId = :userId")
    Optional<Mentor> findByUserId(@Param("userId") Long userId);

    @Query("SELECT m.userDetails.userId FROM Mentor m WHERE m.verificationStatus = :status AND m.userDetails IS NOT NULL")
    List<Long> findMentorUserIdsByVerificationStatus(@Param("status") VerificationStatus status);

    @Query("SELECT m FROM Mentor m JOIN FETCH m.userDetails WHERE m.verificationStatus = :status")
    List<Mentor> findByVerificationStatusWithUserDetails(@Param("status") VerificationStatus status);
    
    List<Mentor> findByVerificationStatus(VerificationStatus status);
    
    List<Mentor> findByVerificationStatusAndSpecializationContainingIgnoreCase(
        VerificationStatus status, String specialization);
    
    Optional<Mentor> findByUserDetails_UserId(Long userId);
}