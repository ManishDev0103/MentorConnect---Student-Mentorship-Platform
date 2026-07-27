package com.mentorship.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.AdminSignupRequest;
import com.mentorship.dtos.ApiResponse;
import com.mentorship.dtos.AuthRequest;
import com.mentorship.dtos.AuthResponse;
import com.mentorship.dtos.MentorSignupRequest;
import com.mentorship.dtos.StudentSignupRequest;
import com.mentorship.security.JwtUtils;
import com.mentorship.security.SecurityUtils;
import com.mentorship.service.AuthServiceImpl;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
@Slf4j
public class AuthController {
	
	private AuthServiceImpl authService;
	private AuthenticationManager authenticationManager;
	private JwtUtils jwtUtils;
	
	@PostMapping("/signin")
	public ResponseEntity<?> signin(@RequestBody @Valid AuthRequest request) {
		log.info("Sign in attempt for email: {}", request.getEmail());
		Authentication authToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
		
		Authentication validAuth = authenticationManager.authenticate(authToken);
		
		log.info("User authenticated successfully: {}", request.getEmail());
		
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new AuthResponse("Successful login !",
						jwtUtils.generateJwtToken(validAuth)));
	}
	
	@PostMapping("/signup/student")
	public ResponseEntity<?> registerStudent(@RequestBody @Valid StudentSignupRequest dto) {
		log.info("Student registration request for email: {}", dto.getEmail());
		try {
			ApiResponse response = authService.registerStudent(dto);
			log.info("Student registered successfully: {}", dto.getEmail());
			return ResponseEntity
					.status(HttpStatus.CREATED)
					.body(response);
		} catch (Exception e) {
			log.error("Student registration failed: {}", dto.getEmail(), e);
			throw e;
		}
	}

	@PostMapping("/signup/mentor")
	public ResponseEntity<?> registerMentor(@RequestBody @Valid MentorSignupRequest dto) {
		log.info("Mentor registration request for email: {}", dto.getEmail());
		try {
			ApiResponse response = authService.registerMentor(dto);
			log.info("Mentor registered successfully: {}", dto.getEmail());
			return ResponseEntity
					.status(HttpStatus.CREATED)
					.body(response);
		} catch (Exception e) {
			log.error("Mentor registration failed: {}", dto.getEmail(), e);
			throw e;
		}
	}
	
	@PostMapping("/signup/admin")
	public ResponseEntity<ApiResponse> registerAdmin(@RequestBody @Valid AdminSignupRequest dto) {
		log.info("Admin registration request received for email: {}", dto.getEmail());
		try {
			ApiResponse response = authService.registerAdmin(dto);
			log.info("Admin registered successfully: {}", dto.getEmail());
			return ResponseEntity
					.status(HttpStatus.CREATED)
					.body(response);
		} catch (Exception e) {
			log.error("Admin registration failed: {}", dto.getEmail(), e);
			throw e;
		}
	}
	
}
