package com.mentorship.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.AvailabilityDTO;
import com.mentorship.dtos.AvailabilityRequestDTO;
import com.mentorship.dtos.DayAvailabilityDTO;
import com.mentorship.dtos.TimeSlotDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.MentorAvailability;
import com.mentorship.repository.MentorAvailabilityRepository;
import com.mentorship.repository.MentorRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final MentorAvailabilityRepository availabilityRepository;
    private final MentorRepository mentorRepository;

    // Default time slots
    private static final List<LocalTime> DEFAULT_SLOTS = List.of(
        LocalTime.of(9, 0),
        LocalTime.of(10, 0),
        LocalTime.of(11, 0),
        LocalTime.of(13, 0),
        LocalTime.of(14, 0),
        LocalTime.of(15, 0),
        LocalTime.of(16, 0),
        LocalTime.of(17, 0)
    );

    @Override
    public DayAvailabilityDTO getAvailabilityForDate(Long mentorId, LocalDate date) {
        List<MentorAvailability> availabilities = availabilityRepository
                .findByMentor_MentorIdAndAvailableDate(mentorId, date);

        List<TimeSlotDTO> timeSlots = DEFAULT_SLOTS.stream()
                .map(time -> {
                    Optional<MentorAvailability> availability = availabilities.stream()
                            .filter(a -> a.getTimeSlot().equals(time))
                            .findFirst();

                    return TimeSlotDTO.builder()
                            .timeSlot(time)
                            .displayTime(time.format(DateTimeFormatter.ofPattern("h:mm a")))
                            .available(availability.map(MentorAvailability::getIsAvailable).orElse(false))
                            .booked(availability.map(MentorAvailability::getIsBooked).orElse(false))
                            .blocked(availability.map(MentorAvailability::getIsBlocked).orElse(false))
                            .build();
                })
                .collect(Collectors.toList());

        return DayAvailabilityDTO.builder()
                .date(date)
                .timeSlots(timeSlots)
                .build();
    }

    @Override
    public List<DayAvailabilityDTO> getAvailabilityForDateRange(Long mentorId, LocalDate startDate, LocalDate endDate) {
        List<DayAvailabilityDTO> result = new ArrayList<>();
        LocalDate current = startDate;
        
        while (!current.isAfter(endDate)) {
            result.add(getAvailabilityForDate(mentorId, current));
            current = current.plusDays(1);
        }
        
        return result;
    }

    @Override
    public List<AvailabilityDTO> setAvailability(Long mentorId, AvailabilityRequestDTO request) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));

        // Delete existing availability for the date
        availabilityRepository.deleteByMentorAndDate(mentorId, request.getDate());

        // Create new availability entries
        List<MentorAvailability> availabilities = request.getTimeSlots().stream()
                .map(time -> {
                    MentorAvailability availability = new MentorAvailability();
                    availability.setMentor(mentor);
                    availability.setAvailableDate(request.getDate());
                    availability.setTimeSlot(time);
                    availability.setIsAvailable(true);
                    availability.setIsBooked(false);
                    availability.setIsBlocked(false);
                    return availability;
                })
                .collect(Collectors.toList());

        List<MentorAvailability> saved = availabilityRepository.saveAll(availabilities);
        
        return saved.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AvailabilityDTO toggleSlotAvailability(Long mentorId, LocalDate date, LocalTime timeSlot) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));

        Optional<MentorAvailability> existing = availabilityRepository
                .findByMentor_MentorIdAndAvailableDateAndTimeSlot(mentorId, date, timeSlot);

        MentorAvailability availability;
        if (existing.isPresent()) {
            availability = existing.get();
            // If currently available, make it unavailable
            // If currently unavailable or blocked, make it available and unblock
            if (availability.getIsAvailable() && !availability.getIsBlocked()) {
                availability.setIsAvailable(false);
            } else {
                availability.setIsAvailable(true);
                availability.setIsBlocked(false); // Unblock when making available
            }
        } else {
            availability = new MentorAvailability();
            availability.setMentor(mentor);
            availability.setAvailableDate(date);
            availability.setTimeSlot(timeSlot);
            availability.setIsAvailable(true);
            availability.setIsBooked(false);
            availability.setIsBlocked(false);
        }

        MentorAvailability saved = availabilityRepository.save(availability);
        return convertToDTO(saved);
    }

    @Override
    public void blockDay(Long mentorId, LocalDate date) {
        availabilityRepository.blockDay(mentorId, date);
    }

    @Override
    public void setWeeklySchedule(Long mentorId, List<LocalTime> timeSlots, LocalDate startDate, int weeks) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));

        List<MentorAvailability> allAvailabilities = new ArrayList<>();
        
        for (int week = 0; week < weeks; week++) {
            for (int day = 0; day < 7; day++) {
                LocalDate currentDate = startDate.plusWeeks(week).plusDays(day);
                
                // Skip weekends if needed (optional)
                // if (currentDate.getDayOfWeek() == DayOfWeek.SATURDAY || 
                //     currentDate.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

                for (LocalTime time : timeSlots) {
                    MentorAvailability availability = new MentorAvailability();
                    availability.setMentor(mentor);
                    availability.setAvailableDate(currentDate);
                    availability.setTimeSlot(time);
                    availability.setIsAvailable(true);
                    availability.setIsBooked(false);
                    availability.setIsBlocked(false);
                    allAvailabilities.add(availability);
                }
            }
        }

        availabilityRepository.saveAll(allAvailabilities);
    }

    @Override
    public boolean isSlotAvailable(Long mentorId, LocalDate date, LocalTime timeSlot) {
        return availabilityRepository.isSlotAvailable(mentorId, date, timeSlot);
    }

    private AvailabilityDTO convertToDTO(MentorAvailability availability) {
        return AvailabilityDTO.builder()
                .availabilityId(availability.getAvailabilityId())
                .mentorId(availability.getMentor().getMentorId())
                .availableDate(availability.getAvailableDate())
                .timeSlot(availability.getTimeSlot())
                .isAvailable(availability.getIsAvailable())
                .isBooked(availability.getIsBooked())
                .isBlocked(availability.getIsBlocked())
                .build();
    }
}
