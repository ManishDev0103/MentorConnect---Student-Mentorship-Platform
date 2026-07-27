package com.mentorship.dtos;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class StudentSessionResponseDTO {

    private Long sessionId;
    private Long mentorId;
    private Long mentorUserId; // Add mentor's userId for chat messaging
    private String mentorName;

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String topic;
    private String description;
    private String status;
    private Double sessionFee;
}
