package com.mentorship.dtos;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlotDTO {
    private LocalTime timeSlot;  // Changed from 'time' to 'timeSlot'
    private String displayTime;
    private Boolean available;   // Changed from 'isAvailable' to 'available'
    private Boolean booked;      // Changed from 'isBooked' to 'booked'
    private Boolean blocked;     // Added blocked field
}
