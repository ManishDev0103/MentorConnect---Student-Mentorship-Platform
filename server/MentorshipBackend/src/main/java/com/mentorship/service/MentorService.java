package com.mentorship.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dto.MentorDTO;
import com.mentorship.dtos.UpdateMentorProfileRequest;

public interface MentorService {
	void uploadResume(Long userId, MultipartFile resume);

	void partialUpdateProfile(Long userId, UpdateMentorProfileRequest dto);

	MentorDTO getMentorById(Long userId);

	List<MentorDTO> getPublicMentors(String domain);

	org.springframework.http.ResponseEntity<byte[]> downloadResume(Long userId);
}
