package com.mentorship.dto;


import lombok.Data;

@Data
public class MentorDTO {

    private Long userId;
    private Long mentorId;
    private String name;
    private String specialization;
    private double ratePerSession;
    private String email;
    private String experience;
    private String about;
    private String expertise;
    private String verificationStatus;
    private String highestEducation;
    private String currentPosition;
    private String organization;
    private String professionalBio;
    private String linkedinUrl;
    private String portfolioUrl;
}
