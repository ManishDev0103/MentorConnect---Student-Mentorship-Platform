package com.mentorship.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.StudyNoteDTO;
import com.mentorship.service.StudyNoteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudyNoteController {

    private final StudyNoteService studyNoteService;

    @PostMapping("/mentor/notes")
    public ResponseEntity<ApiResponseDTO<StudyNoteDTO>> createNote(@RequestParam Long mentorId,
            @RequestParam Long sessionId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String subject,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponseDTO.success("Note uploaded", studyNoteService.createNote(mentorId, sessionId, title, description, subject, file)));
    }

    @PutMapping("/mentor/notes/{id}")
    public ResponseEntity<ApiResponseDTO<StudyNoteDTO>> updateNote(@PathVariable Long id,
            @RequestParam Long mentorId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String subject,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponseDTO.success("Note updated", studyNoteService.updateNote(mentorId, id, title, description, subject, file)));
    }

    @DeleteMapping("/mentor/notes/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteNote(@PathVariable Long id, @RequestParam Long mentorId) {
        studyNoteService.deleteNote(mentorId, id);
        return ResponseEntity.ok(ApiResponseDTO.success("Note deleted", null));
    }

    @GetMapping("/notes")
    public ResponseEntity<ApiResponseDTO<List<StudyNoteDTO>>> getNotes() {
        return ResponseEntity.ok(ApiResponseDTO.success(studyNoteService.getNotes()));
    }

    @GetMapping("/notes/{id}")
    public ResponseEntity<ApiResponseDTO<StudyNoteDTO>> getNote(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.success(studyNoteService.getNote(id)));
    }

    @GetMapping("/mentor/notes/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<StudyNoteDTO>>> getMentorNotes(@PathVariable Long mentorId) {
        return ResponseEntity.ok(ApiResponseDTO.success(studyNoteService.getMentorNotes(mentorId)));
    }

    @GetMapping("/sessions/{sessionId}/notes")
    public ResponseEntity<ApiResponseDTO<List<StudyNoteDTO>>> getSessionNotes(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponseDTO.success(studyNoteService.getSessionNotes(sessionId)));
    }

    @GetMapping("/student/{studentId}/sessions/{sessionId}/notes")
    public ResponseEntity<ApiResponseDTO<List<StudyNoteDTO>>> getStudentSessionNotes(@PathVariable Long studentId,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponseDTO.success(studyNoteService.getSessionNotesForStudent(studentId, sessionId)));
    }
}
