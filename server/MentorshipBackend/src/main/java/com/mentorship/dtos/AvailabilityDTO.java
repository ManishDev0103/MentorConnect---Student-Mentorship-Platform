package com.mentorship.dtos;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityDTO {
    private Long availabilityId;
    private Long mentorId;
    private LocalDate availableDate;
    private LocalTime timeSlot;
    private Boolean isAvailable;
    private Boolean isBooked;
    private Boolean isBlocked;
}
