package com.mentorship.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDTO {
    private Long sessionId;
    private Long mentorId;
    private Long studentId;
    private String studentName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String topic;
    private String description;
    private String status;
    private Double sessionFee;
    private String notes;
}
