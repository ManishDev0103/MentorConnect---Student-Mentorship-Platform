package com.mentorship.dtos;

import java.time.LocalDate;

import com.mentorship.validation.ValidPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorSignupRequest {

    @NotBlank
    @Size(max = 30)
    private String firstName;

    @Size(max = 30)
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, max = 20)
    @ValidPassword
    private String password;

    private LocalDate dob;

    private String address;

    @Size(max = 14)
    private String phoneNo;

    @NotBlank
    private String specialization;

    private String customSpecialization;

    @NotBlank
    private String experience;

    @NotBlank
    private String highestEducation;

    @NotBlank
    private String currentPosition;

    @NotBlank
    private String organization;

    @NotBlank
    @Size(min = 50)
    private String professionalBio;

    private String linkedinUrl;
    private String githubUrl;
    private String twitterUrl;
    private String portfolioUrl;
    private Double ratePerSession;
    private Double discountPercent;
}
