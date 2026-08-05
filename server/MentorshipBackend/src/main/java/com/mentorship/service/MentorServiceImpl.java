package com.mentorship.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.MentorDTO;
import com.mentorship.dtos.UpdateMentorProfileRequest;
import com.mentorship.entities.Mentor;
import com.mentorship.repository.FeedbackRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.SessionRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class MentorServiceImpl implements MentorService {

	private final MentorRepository mentorRepository;
	private final SessionRepository sessionRepository;
	private final FeedbackRepository feedbackRepository;

	@Override
	public void uploadResume(Long userId, MultipartFile resume) {
		// TODO Auto-generated method stub
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor Profile NOT Found.!"));

		if (resume.isEmpty()) {
			throw new ApiException("Resume File Empty..!");
		}

String contentType = resume.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf")
                        && !contentType.equals(
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                        && !contentType.equals("application/msword"))) {

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
	public void uploadDemoVideo(Long userId, MultipartFile demo, String description) {
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor Profile NOT Found.!"));

		if (demo.isEmpty()) {
			throw new ApiException("Demo video file is empty");
		}

		String contentType = demo.getContentType();
		if (contentType == null || !contentType.startsWith("video/")) {
			throw new ApiException("Only video files are allowed");
		}

		try {
			mentor.setDemoVideo(demo.getBytes());
			mentor.setDemoVideoFileName(demo.getOriginalFilename());
			mentor.setDemoVideoContentType(demo.getContentType());
			mentor.setDemoVideoDescription(description != null ? description : null);
			mentorRepository.save(mentor);
		} catch (Exception e) {
			throw new ApiException("Failed to upload demo video");
		}
	}

	@Override
	public void partialUpdateProfile(Long userId, UpdateMentorProfileRequest dto) {
		Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor not found"));

		if (dto.getCustomSpecialization() != null && !dto.getCustomSpecialization().isBlank()) {
			mentor.setCustomSpecialization(dto.getCustomSpecialization());
		}

		if (dto.getSpecialization() != null) {
			String specialization = dto.getSpecialization();
			if ("Other".equalsIgnoreCase(specialization) && dto.getCustomSpecialization() != null && !dto.getCustomSpecialization().isBlank()) {
				specialization = dto.getCustomSpecialization();
			}
			mentor.setSpecialization(specialization);
		}

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

if (dto.getLinkedinUrl() != null) {
            if (!isValidUrl(dto.getLinkedinUrl())) {
                throw new ApiException("Invalid LinkedIn URL");
            }
            mentor.setLinkedinUrl(dto.getLinkedinUrl());
    }

    if (dto.getGithubUrl() != null) {
            if (!isValidUrl(dto.getGithubUrl())) {
                throw new ApiException("Invalid GitHub URL");
            }
            mentor.setGithubUrl(dto.getGithubUrl());
    }

    if (dto.getTwitterUrl() != null) {
            if (!isValidUrl(dto.getTwitterUrl())) {
                throw new ApiException("Invalid Twitter/X URL");
            }
            mentor.setTwitterUrl(dto.getTwitterUrl());
    }

    if (dto.getPortfolioUrl() != null) {
            if (!isValidUrl(dto.getPortfolioUrl())) {
                throw new ApiException("Invalid Portfolio URL");
            }
            mentor.setPortfolioUrl(dto.getPortfolioUrl());
    }

		if (dto.getRatePerSession() != null) {
			double rate = dto.getRatePerSession();
			if (rate <= 0) throw new ApiException("Rate per session must be greater than 0");
			mentor.setRatePerSession(rate);
		}

		if (dto.getDiscountPercent() != null) {
			double disc = dto.getDiscountPercent();
			if (disc < 0 || disc > 100) throw new ApiException("Discount must be between 0 and 100");
			mentor.setDiscountPercent(disc);
		}

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
		List<Mentor> mentors = mentorRepository.findAll().stream()
				.filter(mentor -> mentor != null && !mentor.isDeleted())
				.filter(mentor -> mentor.getVerificationStatus() == com.mentorship.entities.VerificationStatus.VERIFIED)
				.filter(mentor -> domain == null || domain.trim().isEmpty()
						|| (mentor.getSpecialization() != null && mentor.getSpecialization().toLowerCase().contains(domain.trim().toLowerCase()))
						|| (mentor.getCustomSpecialization() != null && mentor.getCustomSpecialization().toLowerCase().contains(domain.trim().toLowerCase())))
				.toList();

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
		dto.setCustomSpecialization(mentor.getCustomSpecialization());
		dto.setRatePerSession(mentor.getRatePerSession());
		dto.setEmail(mentor.getUserDetails().getEmail());
		dto.setExperience(mentor.getExperience());
		dto.setAbout(mentor.getCustomSpecialization() != null && !mentor.getCustomSpecialization().isBlank() ? mentor.getCustomSpecialization() : mentor.getSpecialization());
		dto.setExpertise(mentor.getCustomSpecialization() != null && !mentor.getCustomSpecialization().isBlank() ? mentor.getCustomSpecialization() : mentor.getSpecialization());
		dto.setHighestEducation(mentor.getHighestEducation());
		dto.setCurrentPosition(mentor.getCurrentPosition());
		dto.setOrganization(mentor.getOrganization());
		dto.setProfessionalBio(mentor.getProfessionalBio());
		dto.setLinkedinUrl(mentor.getLinkedinUrl());
		dto.setGithubUrl(mentor.getGithubUrl());
		dto.setTwitterUrl(mentor.getTwitterUrl());
		dto.setPortfolioUrl(mentor.getPortfolioUrl());
		dto.setHasDemo(mentor.getDemoVideo() != null && mentor.getDemoVideo().length > 0);
		dto.setDiscountPercent(mentor.getDiscountPercent());
		double rate = mentor.getRatePerSession();
		double discount = mentor.getDiscountPercent();
		double finalPrice = rate - (rate * discount / 100.0);
		dto.setFinalPrice((double) Math.round(finalPrice));
		if (mentor.getVerificationStatus() != null) {
			dto.setVerificationStatus(mentor.getVerificationStatus().name());
		} else {
			dto.setVerificationStatus("PENDING");
		}
		dto.setRating(getAverageRating(mentor.getMentorId()));
		dto.setReviews(getFeedbackCount(mentor.getMentorId()));
		dto.setSessions(getSessionCount(mentor.getMentorId()));
		return dto;
	}

    private boolean isValidUrl(String url) {
        if (url == null || url.isBlank()) {
            return true;
        }
        try {
            new java.net.URL(url);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Double getAverageRating(Long mentorId) {
        Double rating = feedbackRepository.calculateAverageRating(mentorId);
        return rating != null ? Math.round(rating * 10.0) / 10.0 : 0.0;
    }

    private Integer getFeedbackCount(Long mentorId) {
        Integer count = feedbackRepository.countFeedbackByMentor(mentorId);
        return count != null ? count : 0;
    }

	private Integer getSessionCount(Long mentorId) {
		return sessionRepository.findByMentor_MentorId(mentorId).size();
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

		    @Override
		    public org.springframework.http.ResponseEntity<byte[]> downloadDemoVideo(Long userId) {
			Mentor mentor = mentorRepository.findByUserDetails_UserId(userId)
				.orElseThrow(() -> new ApiException("Mentor not found"));

			if (mentor.getDemoVideo() == null || mentor.getDemoVideo().length == 0) {
			    throw new ApiException("Demo video not found for this mentor");
			}

			return org.springframework.http.ResponseEntity.ok()
				.contentType(org.springframework.http.MediaType.parseMediaType(
					mentor.getDemoVideoContentType() != null ? mentor.getDemoVideoContentType() : "video/mp4"))
				.header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
					"inline; filename=\""
						+ (mentor.getDemoVideoFileName() != null ? mentor.getDemoVideoFileName() : "demo.mp4")
						+ "\"")
				.body(mentor.getDemoVideo());
		    }

}
