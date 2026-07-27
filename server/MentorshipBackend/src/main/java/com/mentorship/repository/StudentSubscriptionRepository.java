package com.mentorship.repository;

import java.util.List;

import com.mentorship.entities.StudentSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSubscriptionRepository extends JpaRepository<StudentSubscription, Long> {

    @Query("SELECT s FROM StudentSubscription s WHERE s.studentId = :studentId AND s.status = 'ACTIVE' AND s.endDate > CURRENT_TIMESTAMP")
    List<StudentSubscription> findActiveSubscription(@Param("studentId") Long studentId);
}
