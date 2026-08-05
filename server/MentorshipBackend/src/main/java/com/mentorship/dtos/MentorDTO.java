package com.mentorship.dtos;

import lombok.Data;

@Data
public class MentorDTO {
    private Long userId;
    private Long mentorId;
    private String name;
    private String email;
    private String specialization;
    private String customSpecialization;
    private Double ratePerSession;
    private Double discountPercent;
    private Double finalPrice;
    private String experience;
    private String about;
    private String expertise;
    private Double rating;
    private Integer reviews;
    private String verificationStatus;
    // Additional fields expected by service mappings
    private String highestEducation;
    private String currentPosition;
    private String organization;
    private String collegeUniversity;
    private String professionalBio;
    private String linkedinUrl;
    private String githubUrl;
    private String twitterUrl;
    private String portfolioUrl;
    private boolean hasDemo;
    private Integer sessions;
}
