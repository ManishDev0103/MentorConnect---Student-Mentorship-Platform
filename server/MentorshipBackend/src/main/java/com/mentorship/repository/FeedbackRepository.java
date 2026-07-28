package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find all feedback for a mentor
    List<Feedback> findByMentor_MentorIdOrderByFeedbackDateDesc(Long mentorId);

    // Find feedback linked to a session
    List<Feedback> findBySession_SessionId(Long sessionId);

    // Find feedback by mentor with pagination
    @Query("SELECT f FROM Feedback f WHERE f.mentor.mentorId = :mentorId ORDER BY f.feedbackDate DESC")
    List<Feedback> findFeedbackByMentor(@Param("mentorId") Long mentorId);

    // Calculate average rating for a mentor
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.mentor.mentorId = :mentorId")
    Double calculateAverageRating(@Param("mentorId") Long mentorId);

    // Count total feedback for a mentor
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.mentor.mentorId = :mentorId")
    Integer countFeedbackByMentor(@Param("mentorId") Long mentorId);

    // Find feedback by rating
    List<Feedback> findByMentor_MentorIdAndRating(Long mentorId, Integer rating);

    // Find recent feedback (limit)
    @Query("SELECT f FROM Feedback f WHERE f.mentor.mentorId = :mentorId ORDER BY f.feedbackDate DESC")
    List<Feedback> findRecentFeedback(@Param("mentorId") Long mentorId, @Param("limit") Integer limit);

    // Find recent platform-wide feedback
    @Query(value = "SELECT * FROM feedbacks f ORDER BY f.feedback_date DESC LIMIT :limit", nativeQuery = true)
    List<Feedback> findRecentPlatformFeedback(@Param("limit") Integer limit);

    // Get rating distribution
    @Query("SELECT f.rating, COUNT(f) FROM Feedback f WHERE f.mentor.mentorId = :mentorId GROUP BY f.rating ORDER BY f.rating DESC")
    List<Object[]> getRatingDistribution(@Param("mentorId") Long mentorId);
}