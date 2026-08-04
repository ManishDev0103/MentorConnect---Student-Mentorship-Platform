package com.mentorship.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {
    private Long userId;
    private String name;
    private String email;
    private String role; // STUDENT, MENTOR, ADMIN
    private String status; // ACTIVE, SUSPENDED, BANNED
    private LocalDateTime joinedDate;
    private String restrictionReason;
    private LocalDateTime restrictionUntil;
    private boolean verified;
}
