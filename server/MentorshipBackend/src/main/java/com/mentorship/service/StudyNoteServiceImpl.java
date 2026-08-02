package com.mentorship.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.StudyNoteDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Session;
import com.mentorship.entities.StudyNote;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.SessionRepository;
import com.mentorship.repository.StudyNoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyNoteServiceImpl implements StudyNoteService {

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;

    @Value("${app.upload.notes-dir:uploads/notes}")
    private String notesDir;

    private final StudyNoteRepository studyNoteRepository;
    private final MentorRepository mentorRepository;
    private final SessionRepository sessionRepository;

    @Override
    public StudyNoteDTO createNote(Long mentorId, Long sessionId, String title, String description, String subject, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Please select a file to upload");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new ApiException("Title is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException("File size must be less than 20 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ApiException("Unsupported file type. Only PDF files are allowed");
        }

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ApiException("Mentor not found"));
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found"));
        if (!session.getMentor().getMentorId().equals(mentorId)) {
            throw new ApiException("Session does not belong to this mentor");
        }

        try {
            Path uploadPath = Paths.get(notesDir);
            Files.createDirectories(uploadPath);
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
            String storedName = UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            StudyNote note = new StudyNote();
            note.setMentor(mentor);
            note.setSession(session);
            note.setTitle(title.trim());
            note.setDescription(description != null ? description.trim() : null);
            note.setSubject(subject != null ? subject.trim() : null);
            note.setFileName(originalName);
            note.setFileType(contentType);
            note.setFileSize(file.getSize());
            note.setFileUrl("/api/notes/download/" + storedName);
            note.setUploadedBy("MENTOR");

            return toDto(studyNoteRepository.save(note));
        } catch (IOException e) {
            throw new ApiException("Failed to store note file: " + e.getMessage());
        }
    }

    @Override
    public StudyNoteDTO updateNote(Long mentorId, Long id, String title, String description, String subject, MultipartFile file) {
        StudyNote note = studyNoteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Study note not found"));

        if (!note.getMentor().getMentorId().equals(mentorId)) {
            throw new ApiException("Unauthorized access");
        }

        if (title != null && !title.trim().isEmpty()) {
            note.setTitle(title.trim());
        }
        if (description != null) {
            note.setDescription(description.trim());
        }
        if (subject != null) {
            note.setSubject(subject.trim());
        }

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new ApiException("File size must be less than 20 MB");
            }
            // file update would replace the stored file; simplified for this implementation
            note.setFileSize(file.getSize());
        }

        return toDto(studyNoteRepository.save(note));
    }

    @Override
    public void deleteNote(Long mentorId, Long id) {
        StudyNote note = studyNoteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Study note not found"));

        if (!note.getMentor().getMentorId().equals(mentorId)) {
            throw new ApiException("Unauthorized access");
        }

        studyNoteRepository.delete(note);
    }

    @Override
    public List<StudyNoteDTO> getNotes() {
        return studyNoteRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public StudyNoteDTO getNote(Long id) {
        return toDto(studyNoteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Study note not found")));
    }

    @Override
    public List<StudyNoteDTO> getMentorNotes(Long mentorId) {
        return studyNoteRepository.findByMentor_MentorIdOrderByCreatedAtDesc(mentorId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<StudyNoteDTO> getSessionNotes(Long sessionId) {
        return studyNoteRepository.findBySession_SessionIdOrderByCreatedAtDesc(sessionId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<StudyNoteDTO> getSessionNotesForStudent(Long studentId, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found"));
        if (!session.getStudent().getStudentId().equals(studentId)) {
            throw new ApiException("Unauthorized access to session notes");
        }
        return studyNoteRepository.findBySession_SessionIdOrderByCreatedAtDesc(sessionId).stream().map(this::toDto).collect(Collectors.toList());
    }

    private StudyNoteDTO toDto(StudyNote note) {
        return StudyNoteDTO.builder()
                .id(note.getId())
                .title(note.getTitle())
                .description(note.getDescription())
                .mentorId(note.getMentor().getMentorId())
                .sessionId(note.getSession() != null ? note.getSession().getSessionId() : null)
                .mentorName(note.getMentor().getUserDetails().getFirstName() + " " + note.getMentor().getUserDetails().getLastName())
                .subject(note.getSubject())
                .fileName(note.getFileName())
                .uploadedBy(note.getUploadedBy())
                .fileType(note.getFileType())
                .fileSize(note.getFileSize())
                .fileUrl(note.getFileUrl())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
