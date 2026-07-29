package com.mentorship.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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

    @DecimalMin(value = "0.01", inclusive = true, message = "Rate per session must be greater than 0")
    private Double ratePerSession;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be between 0 and 100")
    @DecimalMax(value = "100.0", inclusive = true, message = "Discount must be between 0 and 100")
    private Double discountPercent;
}
