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
public class DayAvailabilityDTO {
    private LocalDate date;
    private List<TimeSlotDTO> timeSlots;  // Changed from 'slots' to 'timeSlots'
}
