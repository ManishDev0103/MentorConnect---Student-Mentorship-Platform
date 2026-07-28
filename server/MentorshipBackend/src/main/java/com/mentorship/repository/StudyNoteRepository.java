package com.mentorship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentorship.entities.StudyNote;

@Repository
public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    List<StudyNote> findByMentor_MentorIdOrderByCreatedAtDesc(Long mentorId);
    List<StudyNote> findAllByOrderByCreatedAtDesc();
}
