package com.mentorship.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.StudentCardDTO;
import com.mentorship.service.MyStudentsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/students")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MyStudentsController {

    private static final Logger logger = LoggerFactory.getLogger(MyStudentsController.class);
    private final MyStudentsService myStudentsService;

    /**
     * Get all students for a mentor
     */
    @GetMapping("/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<StudentCardDTO>>> getAllStudents(@PathVariable Long mentorId) {
        logger.info("GET /api/mentor/students/{} - Fetching all students for mentorId", mentorId);
        try {
            List<StudentCardDTO> students = myStudentsService.getAllStudents(mentorId);
            logger.info("Found {} students for mentorId: {}", students.size(), mentorId);
            
            // Create response with mentorId included
            ApiResponseDTO<List<StudentCardDTO>> response = ApiResponseDTO.success(students);
            response.setMessage("mentorId:" + mentorId); // Include mentorId in message for frontend
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching students for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get active students only
     */
    @GetMapping("/{mentorId}/active")
    public ResponseEntity<ApiResponseDTO<List<StudentCardDTO>>> getActiveStudents(@PathVariable Long mentorId) {
        try {
            List<StudentCardDTO> students = myStudentsService.getActiveStudents(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(students));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get student details
     */
    @GetMapping("/{mentorId}/student/{studentId}")
    public ResponseEntity<ApiResponseDTO<StudentCardDTO>> getStudentDetails(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        try {
            StudentCardDTO student = myStudentsService.getStudentDetails(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Update student progress
     */
    @PutMapping("/{mentorId}/student/{studentId}/progress")
    public ResponseEntity<ApiResponseDTO<Void>> updateStudentProgress(
            @PathVariable Long mentorId,
            @PathVariable Long studentId,
            @RequestParam Integer progress) {
        try {
            myStudentsService.updateStudentProgress(mentorId, studentId, progress);
            return ResponseEntity.ok(ApiResponseDTO.success("Progress updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Add a student to mentor
     */
    @PostMapping("/{mentorId}/add/{studentId}")
    public ResponseEntity<ApiResponseDTO<StudentCardDTO>> addStudent(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        logger.info("POST /api/mentor/students/{}/add/{} - Adding student", mentorId, studentId);
        try {
            StudentCardDTO student = myStudentsService.addStudent(mentorId, studentId);
            logger.info("Student {} added successfully to mentorId: {}", studentId, mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success("Student added successfully", student));
        } catch (Exception e) {
            logger.error("Error adding student {} to mentorId: {} - {}", studentId, mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Remove a student from mentor
     */
    @DeleteMapping("/{mentorId}/remove/{studentId}")
    public ResponseEntity<ApiResponseDTO<Void>> removeStudent(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        try {
            myStudentsService.removeStudent(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Student removed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get count of active students
     */
    @GetMapping("/{mentorId}/count")
    public ResponseEntity<ApiResponseDTO<Integer>> countActiveStudents(@PathVariable Long mentorId) {
        try {
            Integer count = myStudentsService.countActiveStudents(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
