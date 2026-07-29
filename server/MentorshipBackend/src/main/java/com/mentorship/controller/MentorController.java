package com.mentorship.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dto.MentorDTO;
import com.mentorship.dtos.UpdateMentorProfileRequest;
import com.mentorship.security.SecurityUtils;
import com.mentorship.service.MentorService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/mentors")
@AllArgsConstructor
public class MentorController {

	private final MentorService mentorService;

	@PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<?> uploadResume(@RequestParam("resume") MultipartFile resume) {

		Long userId = SecurityUtils.getLoggedInUserId();
		mentorService.uploadResume(userId, resume);

		return ResponseEntity.ok("Resume uploaded successfully");
	}

	@PostMapping(value = "/demo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<?> uploadDemo(@RequestParam("demo") MultipartFile demo,
			@RequestParam(value = "description", required = false) String description) {

		Long userId = SecurityUtils.getLoggedInUserId();
		mentorService.uploadDemoVideo(userId, demo, description);

		return ResponseEntity.ok("Demo video uploaded successfully");
	}

	@PatchMapping("/profile")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<?> updateMentorProfile(@RequestBody UpdateMentorProfileRequest dto) {

		Long userId = SecurityUtils.getLoggedInUserId();
		mentorService.partialUpdateProfile(userId, dto);

		return ResponseEntity.ok("Mentor Profile Updated...!");
	}

	@GetMapping("/me")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<MentorDTO> getMyProfile() {
		Long userId = SecurityUtils.getLoggedInUserId();
		return ResponseEntity.ok(mentorService.getMentorById(userId));
	}

	@GetMapping("/public")
	public ResponseEntity<java.util.List<MentorDTO>> getPublicMentors(
			@RequestParam(required = false) String domain) {
		return ResponseEntity.ok(mentorService.getPublicMentors(domain));
	}

	@GetMapping("/{userId}/resume")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<byte[]> downloadResume(@org.springframework.web.bind.annotation.PathVariable Long userId) {
		return mentorService.downloadResume(userId);
	}

	@GetMapping("/{userId}/demo")
	public ResponseEntity<byte[]> downloadDemo(@org.springframework.web.bind.annotation.PathVariable Long userId) {
		return mentorService.downloadDemoVideo(userId);
	}
}
