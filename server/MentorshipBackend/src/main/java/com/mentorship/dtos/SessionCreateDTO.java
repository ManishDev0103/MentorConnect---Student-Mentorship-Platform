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
public class SessionCreateDTO {
    private Long studentId;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String topic;
    private String description;
    private Double sessionFee;
}
