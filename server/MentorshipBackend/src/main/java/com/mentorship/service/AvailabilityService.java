package com.mentorship.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.mentorship.dtos.AvailabilityDTO;
import com.mentorship.dtos.AvailabilityRequestDTO;
import com.mentorship.dtos.DayAvailabilityDTO;

public interface AvailabilityService {
    
    // Get availability for a specific date
    DayAvailabilityDTO getAvailabilityForDate(Long mentorId, LocalDate date);
    
    // Get availability for date range
    List<DayAvailabilityDTO> getAvailabilityForDateRange(Long mentorId, LocalDate startDate, LocalDate endDate);
    
    // Set availability for a date
    List<AvailabilityDTO> setAvailability(Long mentorId, AvailabilityRequestDTO request);
    
    // Toggle slot availability
    AvailabilityDTO toggleSlotAvailability(Long mentorId, LocalDate date, LocalTime timeSlot);
    
    // Block entire day
    void blockDay(Long mentorId, LocalDate date);
    
    // Set weekly schedule (recurring)
    void setWeeklySchedule(Long mentorId, List<LocalTime> timeSlots, LocalDate startDate, int weeks);
    
    // Check if slot is available
    boolean isSlotAvailable(Long mentorId, LocalDate date, LocalTime timeSlot);
}
