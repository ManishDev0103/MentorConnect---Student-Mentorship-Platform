package com.mentorship.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class SessionDTO {

    private Long sessionId;
    private Long mentorId;
    private Long studentId;

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String topic;
    private String description;
    private String status;

    private Double sessionFee;
    private String notes;
}
