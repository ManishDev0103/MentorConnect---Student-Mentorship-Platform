package com.mentorship.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dto.MentorDTO;
import com.mentorship.dtos.UpdateMentorProfileRequest;
import com.mentorship.entities.Mentor;
import com.mentorship.repository.MentorRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class MentorServiceImpl implements MentorService {

	private final MentorRepository mentorRepository;

	@Override
	public void uploadResume(Long userId, MultipartFile resume) {
		// TODO Auto-generated method stub
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor Profile NOT Found.!"));

		if (resume.isEmpty()) {
			throw new ApiException("Resume File Empty..!");
		}

		if (!resume.getContentType().equals("application/pdf")
				&& !resume.getContentType().equals(
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document")
				&& !resume.getContentType().equals("application/msword")) {

			throw new ApiException("Only PDF or DOC/DOCX allowed");
		}
		try {
			mentor.setResume(resume.getBytes());
			mentor.setResumeFileName(resume.getOriginalFilename());
			mentor.setResumeContentType(resume.getContentType());
			mentorRepository.save(mentor);
		} catch (Exception e) {
			throw new ApiException("Failed to Upload Resume..!");
		}

	}

	@Override
	public void partialUpdateProfile(Long userId, UpdateMentorProfileRequest dto) {
		// TODO Auto-generated method stub
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor not found"));

		if (dto.getSpecialization() != null)
			mentor.setSpecialization(dto.getSpecialization());

		if (dto.getExperience() != null)
			mentor.setExperience(dto.getExperience());

		if (dto.getHighestEducation() != null)
			mentor.setHighestEducation(dto.getHighestEducation());

		if (dto.getCurrentPosition() != null)
			mentor.setCurrentPosition(dto.getCurrentPosition());

		if (dto.getOrganization() != null)
			mentor.setOrganization(dto.getOrganization());

		if (dto.getProfessionalBio() != null)
			mentor.setProfessionalBio(dto.getProfessionalBio());

		if (dto.getLinkedinUrl() != null)
			mentor.setLinkedinUrl(dto.getLinkedinUrl());

		if (dto.getPortfolioUrl() != null)
			mentor.setPortfolioUrl(dto.getPortfolioUrl());

		mentorRepository.save(mentor);
	}

	@Override
	public MentorDTO getMentorById(Long userId) {

		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new RuntimeException("Mentor Not found for the user..!"));
		return mapToDTO(mentor);
	}

	@Override
	public List<MentorDTO> getPublicMentors(String domain) {
		List<Mentor> mentors;
		if (domain == null || domain.trim().isEmpty()) {
			mentors = mentorRepository.findByVerificationStatus(com.mentorship.entities.VerificationStatus.VERIFIED);
		} else {
			mentors = mentorRepository.findByVerificationStatusAndSpecializationContainingIgnoreCase(
					com.mentorship.entities.VerificationStatus.VERIFIED, domain.trim());
		}

		return mentors.stream()
				.map(this::mapToDTO)
				.toList();
	}

	private MentorDTO mapToDTO(Mentor mentor) {

		MentorDTO dto = new MentorDTO();
		if (mentor.getUserDetails() != null) {
			dto.setUserId(mentor.getUserDetails().getUserId());
		}
		dto.setMentorId(mentor.getMentorId());
		dto.setName(mentor.getUserDetails().getFirstName() + " " + mentor.getUserDetails().getLastName());
		dto.setSpecialization(mentor.getSpecialization());
		dto.setRatePerSession(mentor.getRatePerSession());
		dto.setEmail(mentor.getUserDetails().getEmail());
		dto.setExperience(mentor.getExperience());
		dto.setAbout(mentor.getSpecialization());
		dto.setExpertise(mentor.getSpecialization());
		dto.setHighestEducation(mentor.getHighestEducation());
		dto.setCurrentPosition(mentor.getCurrentPosition());
		dto.setOrganization(mentor.getOrganization());
		dto.setProfessionalBio(mentor.getProfessionalBio());
		dto.setLinkedinUrl(mentor.getLinkedinUrl());
		dto.setPortfolioUrl(mentor.getPortfolioUrl());
		if (mentor.getVerificationStatus() != null) {
			dto.setVerificationStatus(mentor.getVerificationStatus().name());
		} else {
			dto.setVerificationStatus("PENDING");
		}

		return dto;
	}

	@Override
	public org.springframework.http.ResponseEntity<byte[]> downloadResume(Long userId) {
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor not found"));

		if (mentor.getResume() == null || mentor.getResume().length == 0) {
			throw new ApiException("Resume not found for this mentor");
		}

		return org.springframework.http.ResponseEntity.ok()
				.contentType(org.springframework.http.MediaType.parseMediaType(
						mentor.getResumeContentType() != null ? mentor.getResumeContentType() : "application/pdf"))
				.header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
						"inline; filename=\""
								+ (mentor.getResumeFileName() != null ? mentor.getResumeFileName() : "resume.pdf")
								+ "\"")
				.body(mentor.getResume());
	}

}
