package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.VideoLecture;

@Repository
public interface VideoLectureRepository extends JpaRepository<VideoLecture, Long> {
    List<VideoLecture> findByMentor_MentorIdOrderByCreatedAtDesc(Long mentorId);
    List<VideoLecture> findAllByOrderByCreatedAtDesc();
}
