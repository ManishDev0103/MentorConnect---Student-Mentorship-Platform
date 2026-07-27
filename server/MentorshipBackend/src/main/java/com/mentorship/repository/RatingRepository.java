package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.Mentor;
import com.mentorship.entities.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByMentorAndIsActiveTrue(Mentor mentor);

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.mentor.mentorId = :mentorId AND r.isActive = true")
    Double getAverageRatingByMentorId(Long mentorId);
}
