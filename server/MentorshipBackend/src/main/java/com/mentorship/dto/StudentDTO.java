package com.mentorship.dto;

import lombok.Data;

@Data
public class StudentDTO {
    private Long studentId;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String targetDomain;
    private String qualification;
}