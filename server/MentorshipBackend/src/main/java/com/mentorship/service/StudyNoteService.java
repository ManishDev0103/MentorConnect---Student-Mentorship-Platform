package com.mentorship.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dtos.StudyNoteDTO;

public interface StudyNoteService {
    StudyNoteDTO createNote(Long mentorId, Long sessionId, String title, String description, String subject, MultipartFile file);
    StudyNoteDTO updateNote(Long mentorId, Long id, String title, String description, String subject, MultipartFile file);
    void deleteNote(Long mentorId, Long id);
    List<StudyNoteDTO> getNotes();
    StudyNoteDTO getNote(Long id);
    List<StudyNoteDTO> getMentorNotes(Long mentorId);
    List<StudyNoteDTO> getSessionNotes(Long sessionId);
    List<StudyNoteDTO> getSessionNotesForStudent(Long studentId, Long sessionId);
}
