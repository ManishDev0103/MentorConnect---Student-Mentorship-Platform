package com.mentorship.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UpdateMentorProfileRequest {
	private String specialization;
    private String customSpecialization;
    private String experience;
    private String highestEducation;
    private String currentPosition;
    private String organization;

    @Size(min = 50)
    private String professionalBio;

    private String linkedinUrl;
    private String portfolioUrl;
}
