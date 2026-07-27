package com.mentorship.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class StudentSessionDTO {

    private Long mentorId;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String topic;
    private String description;
}
