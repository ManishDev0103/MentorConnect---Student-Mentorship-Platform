package com.mentorship.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import com.mentorship.entities.MentorAvailability;

@Repository
public interface MentorAvailabilityRepository extends JpaRepository<MentorAvailability, Long> {

    // Find all availability for a mentor on a specific date
    List<MentorAvailability> findByMentor_MentorIdAndAvailableDate(Long mentorId, LocalDate date);

    // Find availability for a mentor between dates
    @Query("SELECT ma FROM MentorAvailability ma WHERE ma.mentor.mentorId = :mentorId " +
           "AND ma.availableDate BETWEEN :startDate AND :endDate ORDER BY ma.availableDate, ma.timeSlot")
    List<MentorAvailability> findByMentorAndDateRange(@Param("mentorId") Long mentorId,
                                                       @Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);

    // Find specific slot
       @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<MentorAvailability> findByMentor_MentorIdAndAvailableDateAndTimeSlot(Long mentorId, 
                                                                                   LocalDate date, 
                                                                                   LocalTime timeSlot);

    // Find available (not booked) slots for a mentor on a date
    @Query("SELECT ma FROM MentorAvailability ma WHERE ma.mentor.mentorId = :mentorId " +
           "AND ma.availableDate = :date AND ma.isAvailable = true AND ma.isBooked = false " +
           "AND ma.isBlocked = false ORDER BY ma.timeSlot")
    List<MentorAvailability> findAvailableSlots(@Param("mentorId") Long mentorId, @Param("date") LocalDate date);

    // Delete all availability for a mentor on a specific date
    @Modifying
    @Query("DELETE FROM MentorAvailability ma WHERE ma.mentor.mentorId = :mentorId AND ma.availableDate = :date")
    void deleteByMentorAndDate(@Param("mentorId") Long mentorId, @Param("date") LocalDate date);

    // Block a day for a mentor
    @Modifying
    @Query("UPDATE MentorAvailability ma SET ma.isBlocked = true WHERE ma.mentor.mentorId = :mentorId " +
           "AND ma.availableDate = :date")
    void blockDay(@Param("mentorId") Long mentorId, @Param("date") LocalDate date);

    // Unblock a day for a mentor
    @Modifying
    @Query("UPDATE MentorAvailability ma SET ma.isBlocked = false WHERE ma.mentor.mentorId = :mentorId " +
           "AND ma.availableDate = :date")
    void unblockDay(@Param("mentorId") Long mentorId, @Param("date") LocalDate date);

    // Check if slot is available
    @Query("SELECT CASE WHEN COUNT(ma) > 0 THEN true ELSE false END FROM MentorAvailability ma " +
           "WHERE ma.mentor.mentorId = :mentorId AND ma.availableDate = :date AND ma.timeSlot = :timeSlot " +
           "AND ma.isAvailable = true AND ma.isBooked = false AND ma.isBlocked = false")
    boolean isSlotAvailable(@Param("mentorId") Long mentorId, 
                            @Param("date") LocalDate date, 
                            @Param("timeSlot") LocalTime timeSlot);
}
