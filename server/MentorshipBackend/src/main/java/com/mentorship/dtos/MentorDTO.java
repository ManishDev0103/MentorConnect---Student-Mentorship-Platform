package com.mentorship.dtos;

import lombok.Data;

@Data
public class MentorDTO {
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
}
