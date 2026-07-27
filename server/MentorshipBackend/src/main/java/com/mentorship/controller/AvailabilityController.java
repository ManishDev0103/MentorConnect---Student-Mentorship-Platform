package com.mentorship.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.AvailabilityDTO;
import com.mentorship.dtos.AvailabilityRequestDTO;
import com.mentorship.dtos.DayAvailabilityDTO;
import com.mentorship.service.AvailabilityService;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor/availability")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AvailabilityController {

    private static final Logger logger = LoggerFactory.getLogger(AvailabilityController.class);
    private final AvailabilityService availabilityService;

    /**
     * Get availability for a specific date
     */
    @GetMapping("/{mentorId}/date/{date}")
    public ResponseEntity<ApiResponseDTO<DayAvailabilityDTO>> getAvailabilityForDate(
            @PathVariable Long mentorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        logger.info("GET /api/mentor/availability/{}/date/{} - Fetching availability", mentorId, date);
        try {
            DayAvailabilityDTO availability = availabilityService.getAvailabilityForDate(mentorId, date);
            logger.info("Availability fetched for mentorId: {}, date: {}", mentorId, date);
            return ResponseEntity.ok(ApiResponseDTO.success(availability));
        } catch (Exception e) {
            logger.error("Error fetching availability for mentorId: {}, date: {} - {}", mentorId, date, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Get availability for a date range
     */
    @GetMapping("/{mentorId}/range")
    public ResponseEntity<ApiResponseDTO<List<DayAvailabilityDTO>>> getAvailabilityForDateRange(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<DayAvailabilityDTO> availability = availabilityService.getAvailabilityForDateRange(mentorId, startDate, endDate);
            return ResponseEntity.ok(ApiResponseDTO.success(availability));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Set availability for a date
     */
    @PostMapping("/{mentorId}/set")
    public ResponseEntity<ApiResponseDTO<List<AvailabilityDTO>>> setAvailability(
            @PathVariable Long mentorId,
            @RequestBody AvailabilityRequestDTO request) {
        logger.info("POST /api/mentor/availability/{}/set - Setting availability for date: {}", mentorId, request.getDate());
        try {
            List<AvailabilityDTO> availability = availabilityService.setAvailability(mentorId, request);
            logger.info("Availability set successfully for mentorId: {}, slots: {}", mentorId, availability.size());
            return ResponseEntity.ok(ApiResponseDTO.success("Availability set successfully", availability));
        } catch (Exception e) {
            logger.error("Error setting availability for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Toggle a specific time slot
     */
    @PutMapping("/{mentorId}/toggle")
    public ResponseEntity<ApiResponseDTO<AvailabilityDTO>> toggleSlot(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Time slot in HH:mm:ss format (e.g., 10:00:00)", example = "10:00:00", schema = @Schema(type = "string", format = "time"))
            @RequestParam @DateTimeFormat(pattern = "HH:mm:ss") LocalTime timeSlot) {
        logger.info("PUT /api/mentor/availability/{}/toggle - Toggling slot: {} at {}", mentorId, date, timeSlot);
        try {
            AvailabilityDTO availability = availabilityService.toggleSlotAvailability(mentorId, date, timeSlot);
            logger.info("Slot toggled successfully for mentorId: {}, isAvailable: {}", mentorId, availability.getIsAvailable());
            return ResponseEntity.ok(ApiResponseDTO.success("Slot toggled successfully", availability));
        } catch (Exception e) {
            logger.error("Error toggling slot for mentorId: {} - {}", mentorId, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Block an entire day
     */
    @PostMapping("/{mentorId}/block-day")
    public ResponseEntity<ApiResponseDTO<Void>> blockDay(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            availabilityService.blockDay(mentorId, date);
            return ResponseEntity.ok(ApiResponseDTO.success("Day blocked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Set weekly schedule
     */
    @PostMapping("/{mentorId}/weekly-schedule")
    public ResponseEntity<ApiResponseDTO<Void>> setWeeklySchedule(
            @PathVariable Long mentorId,
            @RequestBody List<LocalTime> timeSlots,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(defaultValue = "4") int weeks) {
        try {
            availabilityService.setWeeklySchedule(mentorId, timeSlots, startDate, weeks);
            return ResponseEntity.ok(ApiResponseDTO.success("Weekly schedule set successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * Check if a slot is available
     */
    @GetMapping("/{mentorId}/check")
    public ResponseEntity<ApiResponseDTO<Boolean>> checkSlotAvailability(
            @PathVariable Long mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Time slot in HH:mm:ss format (e.g., 10:00:00)", example = "10:00:00", schema = @Schema(type = "string", format = "time"))
            @RequestParam @DateTimeFormat(pattern = "HH:mm:ss") LocalTime timeSlot) {
        try {
            boolean isAvailable = availabilityService.isSlotAvailable(mentorId, date, timeSlot);
            return ResponseEntity.ok(ApiResponseDTO.success(isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponseDTO.error(e.getMessage()));
        }
    }
}
