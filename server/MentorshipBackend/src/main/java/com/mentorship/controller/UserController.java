package com.mentorship.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dtos.ChangePasswordRequest;
import com.mentorship.dtos.ForgotPasswordRequest;
import com.mentorship.dtos.UserResp;
import com.mentorship.entities.User;
import com.mentorship.security.SecurityUtils;
import com.mentorship.service.UserService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

	private UserService userService;

	@GetMapping
	public ResponseEntity<?> getAllUsers() {
		System.out.println("in get all users");
		List<UserResp> users = userService.getAllUsers();

		if (users.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}
		return ResponseEntity.ok(users);
	}

	@PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile image) {
		Long userId = SecurityUtils.getLoggedInUserId();

		userService.uploadProfileImage(userId, image);
		return ResponseEntity.ok("Profile image uploaded");
	}

	@GetMapping("/image/{userId}")
	public ResponseEntity<byte[]> getProfileImage(@PathVariable Long userId) {
		User user = userService.getUserById(userId);

		if (user.getImage() == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok()
				.contentType(MediaType.IMAGE_JPEG)
				.body(user.getImage());
	}

	@GetMapping("/image/me")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<byte[]> getMyProfileImage() {
		Long userId = SecurityUtils.getLoggedInUserId();
		User user = userService.getUserById(userId);

		if (user.getImage() == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok()
				.contentType(MediaType.IMAGE_JPEG)
				.body(user.getImage());
	}

	@GetMapping("/me")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<UserResp> getMyProfileDetails() {
		Long userId = SecurityUtils.getLoggedInUserId();
		UserResp userResp = userService.getUserRespById(userId);
		return ResponseEntity.ok(userResp);
	}

	@DeleteMapping("/me")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> deleteMyAccount() {
		Long userId = SecurityUtils.getLoggedInUserId();
		userService.deleteUserById(userId);
		return ResponseEntity.ok("Account deleted successfully");
	}

	@PatchMapping("/change-password")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> changePassword(
			@RequestBody @Valid ChangePasswordRequest dto) {

		Long userId = SecurityUtils.getLoggedInUserId();

		userService.changePassword(userId, dto);

		return ResponseEntity.ok("Password changed successfully");
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(
			@RequestBody @Valid ForgotPasswordRequest dto) {

		userService.processForgotPassword(dto.getEmail());

		return ResponseEntity.ok(
				"If the email exists, a reset link has been sent");
	}

}
