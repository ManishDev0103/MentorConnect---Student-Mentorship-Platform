package com.mentorship.dtos;

import java.time.LocalDateTime;

import com.mentorship.entities.VerificationStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PendingVerificationDto {
    private Long userId;
    private String name;
    private String email;
    private String type; // MENTOR or STUDENT
    private LocalDateTime submittedAt;
    private VerificationStatus status;
    private String specialization; // for mentors
}
