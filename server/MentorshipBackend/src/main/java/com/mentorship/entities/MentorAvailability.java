package com.mentorship.entities;

import java.time.LocalDate;
import java.time.LocalTime;

import com.mentorship.entities.BaseEntity;
import com.mentorship.entities.Mentor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mentor_availability",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"mentor_id", "available_date", "time_slot"},
           name = "uk_mentor_date_slot"
       ))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MentorAvailability extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long availabilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_availability_mentor"))
    private Mentor mentor;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "time_slot", nullable = false)
    private LocalTime timeSlot;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_booked")
    private Boolean isBooked = false;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;
}
