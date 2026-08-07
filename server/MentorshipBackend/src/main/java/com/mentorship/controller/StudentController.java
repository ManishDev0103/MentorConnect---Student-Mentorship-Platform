package com.mentorship.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.FeedbackRequestDTO;
import com.mentorship.dtos.FeedbackResponseDTO;
import com.mentorship.dtos.MCQAttemptDTO;
import com.mentorship.dtos.MCQPracticeSessionDTO;
import com.mentorship.dtos.MCQQuestionDTO;
import com.mentorship.dtos.MentorDTO;
import com.mentorship.dtos.StudentDTO;
import com.mentorship.dtos.StudentSessionDTO;
import com.mentorship.dtos.StudentSessionResponseDTO;
import com.mentorship.dtos.SubmitMCQAnswerDTO;
import com.mentorship.security.SecurityUtils;
import com.mentorship.service.MCQPracticeSessionService;
import com.mentorship.service.MCQService;
import com.mentorship.service.StudentService;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

	@Autowired
	private StudentService studentService;

	@Autowired
	private MCQPracticeSessionService mcqSessionService;

	@Autowired
	private MCQService mcqService;

	// get student by user id (more specific, must come first)
	@GetMapping("/user/{userId}")
	public ResponseEntity<StudentDTO> getStudentByUserId(@PathVariable Long userId) {
		return ResponseEntity.ok(studentService.getStudentByUserId(userId));
	}

	// get student by id (generic, must come after more specific paths)
	@GetMapping("/{id}")
	public ResponseEntity<StudentDTO> getStudent(@PathVariable Long id) {
		return ResponseEntity.ok(studentService.getStudentById(id));
	}

	// get all students
	@GetMapping
	public List<StudentDTO> getAllStudents() {
		return studentService.getAllStudents();
	}

	// insert student
	@PostMapping
	public StudentDTO createStudent(@RequestBody StudentDTO dto) {
		return studentService.createStudent(dto);
	}

	// Update Student Profile
	@PutMapping("/{id}")
	public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO dto) {
		return ResponseEntity.ok(studentService.updateStudent(id, dto));
	}

	// Upload Profile Image
	@PostMapping("/{id}/image")
	public ResponseEntity<String> uploadImage(@PathVariable Long id,
			@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
		try {
			studentService.uploadProfileImage(id, file.getBytes());
			return ResponseEntity.ok("Image uploaded successfully");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error uploading image: " + e.getMessage());
		}
	}

	// Get Profile Image
	@GetMapping(value = "/{id}/image", produces = org.springframework.http.MediaType.IMAGE_JPEG_VALUE)
	public ResponseEntity<byte[]> getProfileImage(@PathVariable Long id) {
		byte[] image = studentService.getProfileImage(id);
		if (image == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(image);
	}

	@PostMapping(value = "/{studentId}/resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('STUDENT')")
	public ResponseEntity<String> uploadResume(
			@PathVariable Long studentId,
			@RequestParam("resume") org.springframework.web.multipart.MultipartFile resume) {
		try {
			Long loggedUserId = SecurityUtils.getLoggedInUserId();
			StudentDTO student = studentService.getStudentById(studentId);
			if (!loggedUserId.equals(student.getUserId())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
			}
			studentService.uploadResume(studentId, resume);
			return ResponseEntity.ok("Resume uploaded successfully");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error uploading resume: " + e.getMessage());
		}
	}

	@GetMapping("/{studentId}/resume")
	@PreAuthorize("hasRole('STUDENT')")
	public ResponseEntity<byte[]> downloadResume(@PathVariable Long studentId) {
		try {
			Long loggedUserId = SecurityUtils.getLoggedInUserId();
			StudentDTO student = studentService.getStudentById(studentId);
			if (!loggedUserId.equals(student.getUserId())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}
			return studentService.downloadResume(studentId);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// delete student by id
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteStudent(@PathVariable Long id) {

		if (studentService.deleteStudent(id)) {
			return ResponseEntity.ok("Student with ID " + id + " deleted successfully");
		}

		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body("Student not found");
	}

	// Browse Verified Mentors
	@GetMapping("/mentors")
	public ResponseEntity<List<MentorDTO>> getVerifiedMentors(
			@RequestParam Long studentId,
			@RequestParam(required = false) String domain) {
		return ResponseEntity.ok(studentService.getVerifiedMentors(studentId, domain));
	}

	@GetMapping("/subscription")
	public ResponseEntity<com.mentorship.entities.StudentSubscription> getSubscriptionStatus(
			@RequestParam Long studentId) {
		com.mentorship.entities.StudentSubscription sub = studentService.getActiveSubscription(studentId);
		if (sub == null) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(sub);
	}

	// Get Mentor Details by ID
	@GetMapping("/mentor/{mentorId}")
	public ResponseEntity<MentorDTO> getMentorDetails(@PathVariable Long mentorId) {
		return ResponseEntity.ok(studentService.getMentorDetails(mentorId));
	}

	// Book Session
	@PostMapping("/{studentId}/sessions")
	public ResponseEntity<StudentSessionDTO> bookSession(
			@PathVariable Long studentId,
			@RequestBody StudentSessionDTO dto) {

		return new ResponseEntity<>(studentService.bookSession(studentId, dto),
				HttpStatus.CREATED);
	}

	// GET student sessions
	@GetMapping("/{studentId}/sessions")
	public ResponseEntity<List<StudentSessionResponseDTO>> getStudentSessions(
			@PathVariable Long studentId) {

		return ResponseEntity.ok(studentService.getStudentSessions(studentId));
	}

	// Cancel Session
	@PatchMapping("/sessions/{sessionId}/cancel")
	public ResponseEntity<String> cancelSession(@PathVariable Long sessionId) {

		studentService.cancelSession(sessionId);
		return ResponseEntity.ok("Session cancelled successfully");
	}

	// Delete Session (for payment cleanup)
	@DeleteMapping("/sessions/{sessionId}")
	public ResponseEntity<String> deleteSession(@PathVariable Long sessionId) {
		studentService.deleteSession(sessionId);
		return ResponseEntity.ok("Session deleted successfully");
	}

	// Student Dashboard
	@GetMapping("/{studentId}/dashboard")
	public ResponseEntity<?> getDashboard(@PathVariable Long studentId) {
		return ResponseEntity.ok(studentService.getStudentDashboard(studentId));
	}

	// Student gives feedback
	@PostMapping("/{studentId}/feedback")
	public ResponseEntity<FeedbackResponseDTO> giveFeedback(
			@PathVariable Long studentId,
			@RequestBody FeedbackRequestDTO dto) {

		return new ResponseEntity<>(studentService.giveFeedback(studentId, dto),
				HttpStatus.CREATED);
	}

	// Student sees his feedbacks
	@GetMapping("/{studentId}/feedback")
	public ResponseEntity<List<FeedbackResponseDTO>> getFeedbacks(@PathVariable Long studentId) {
		return ResponseEntity.ok(studentService.getStudentFeedbacks(studentId));
	}

	// ==========================================
	// SUBSCRIPTION NOTIFICATION (Webhook from .NET)
	// ==========================================
	@PostMapping("/subscription/notify")
	public ResponseEntity<String> handleSubscriptionNotification(
			@RequestBody com.mentorship.entities.StudentSubscription sub) {
		System.out.println("Received Subscription Notification for Student ID: " + sub.getStudentId());

		// Set status explicitly if missing, though .NET sends it
		if (sub.getStatus() == null) {
			sub.setStatus("ACTIVE");
		}

		com.mentorship.entities.StudentSubscription saved = studentService.saveSubscription(sub);

		System.out.println("Subscription Saved Successfully: ID " + saved.getId());
		return ResponseEntity.ok("Notification received and processed");
	}

	@PostMapping("/payment/session-notify")
	public ResponseEntity<String> handleSessionPaymentNotification(
			@RequestBody com.mentorship.dtos.SessionPaymentNotificationDTO dto) {
		try {
			studentService.processSessionPayment(dto);
			return ResponseEntity.ok("Session Payment Processed");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		}
	}

	// ==========================================
	// STUDY TIMER ENDPOINTS
	// ==========================================

	@PostMapping("/{studentId}/study/start")
	public ResponseEntity<com.mentorship.entities.StudySession> startStudySession(
			@PathVariable Long studentId,
			@RequestParam String taskName) {
		return ResponseEntity.ok(studentService.startStudySession(studentId, taskName));
	}

	@PostMapping("/study/stop/{sessionId}")
	public ResponseEntity<com.mentorship.entities.StudySession> stopStudySession(
			@PathVariable Long sessionId) {
		return ResponseEntity.ok(studentService.stopStudySession(sessionId));
	}

	@DeleteMapping("/study/{sessionId}")
	public ResponseEntity<String> deleteStudySession(@PathVariable Long sessionId) {
		studentService.deleteStudySession(sessionId);
		return ResponseEntity.ok("Session deleted successfully");
	}

	@GetMapping("/{studentId}/study/history")
	public ResponseEntity<List<com.mentorship.entities.StudySession>> getStudyHistory(
			@PathVariable Long studentId) {
		return ResponseEntity.ok(studentService.getStudyHistory(studentId));
	}

	// ==========================================
	// MCQ PRACTICE ENDPOINTS FOR STUDENTS
	// ==========================================
	
	/**
	 * Get all MCQ practice sessions assigned to the student
	 */
	@GetMapping("/{studentId}/mcq/sessions")
	public ResponseEntity<List<MCQPracticeSessionDTO>> getStudentMCQSessions(
			@PathVariable Long studentId) {
		List<MCQPracticeSessionDTO> sessions = mcqSessionService.getSessionsByStudent(studentId);
		return ResponseEntity.ok(sessions);
	}
	
	/**
	 * Get MCQ questions for a specific session
	 */
	@GetMapping("/{studentId}/mcq/sessions/{sessionId}/questions")
	public ResponseEntity<List<MCQQuestionDTO>> getMCQQuestionsForSession(
			@PathVariable Long studentId,
			@PathVariable Long sessionId) {
		List<MCQQuestionDTO> questions = mcqService.getMCQQuestionsBySession(sessionId);
		return ResponseEntity.ok(questions);
	}
	
	/**
	 * Submit answer for an MCQ question
	 */
	@PostMapping("/{studentId}/mcq/submit")
	public ResponseEntity<MCQAttemptDTO> submitMCQAnswer(
			@PathVariable Long studentId,
			@RequestBody SubmitMCQAnswerDTO submitDTO) {
		MCQAttemptDTO attempt = mcqService.submitAnswer(studentId, submitDTO);
		return ResponseEntity.ok(attempt);
	}
	
	/**
	 * Get student's MCQ attempts for a session
	 */
	@GetMapping("/{studentId}/mcq/sessions/{sessionId}/attempts")
	public ResponseEntity<List<MCQAttemptDTO>> getSessionAttempts(
			@PathVariable Long studentId,
			@PathVariable Long sessionId) {
		List<MCQAttemptDTO> attempts = mcqService.getAttemptsForSession(studentId, sessionId);
		return ResponseEntity.ok(attempts);
	}

}
