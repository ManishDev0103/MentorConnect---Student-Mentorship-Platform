import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Availability.css";
import "../../../styles/common.css";
import {
  getAvailabilityForDate,
  toggleSlotAvailability,
  blockDay,
} from "../../../service/mentorService";
import { showSuccess, handleApiError } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function Availability() {
  const [date, setDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  // Get mentor ID from localStorage (set during login)
  const mentorId = getMentorId();

  const slots = [
    "09:00:00",
    "10:00:00",
    "11:00:00",
    "13:00:00",
    "14:00:00",
    "15:00:00",
    "16:00:00",
    "17:00:00",
  ];

  useEffect(() => {
    fetchAvailability();
  }, [date]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await getAvailabilityForDate(mentorId, date);

      if (response.success && response.data) {
        const available = response.data.timeSlots
          .filter((slot) => slot.available && !slot.booked && !slot.blocked)
          .map((slot) => slot.timeSlot);

        const blocked = response.data.timeSlots
          .filter((slot) => slot.blocked)
          .map((slot) => slot.timeSlot);

        setAvailableSlots(available);
        setBlockedSlots(blocked);
      } else {
        // No slots exist for this date yet
        setAvailableSlots([]);
        setBlockedSlots([]);
      }
    } catch (error) {
      handleApiError(error, "Failed to load availability");
      setAvailableSlots([]);
      setBlockedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = async (slot) => {
    try {
      setToggling(slot);
      const response = await toggleSlotAvailability(mentorId, date, slot);

      if (response.success) {
        // Refresh availability
        await fetchAvailability();
        showSuccess(response.message || "Slot updated successfully");
      }
    } catch (error) {
      handleApiError(error, "Failed to update slot");
    } finally {
      setToggling(null);
    }
  };

  const handleBlockDay = async () => {
    if (!window.confirm("Are you sure you want to block this entire day?")) {
      return;
    }

    try {
      const response = await blockDay(mentorId, date);
      if (response.success) {
        await fetchAvailability();
        showSuccess(response.message || "Day blocked successfully");
      }
    } catch (error) {
      handleApiError(error, "Failed to block day");
    }
  };

  const formatTimeSlot = (timeSlot) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeSlot.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const isPastDate = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isPastTimeSlot = (slot) => {
    // Check if the date is in the past
    if (isPastDate(date)) {
      return true;
    }

    // Check if it's today and the time has passed
    const today = new Date();
    const selectedDate = new Date(date);

    // Check if it's today
    if (selectedDate.toDateString() === today.toDateString()) {
      // Parse the slot time (format: "HH:MM:SS")
      const [hours, minutes] = slot.split(":").map(Number);
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();

      // Check if the slot time has passed
      if (
        hours < currentHour ||
        (hours === currentHour && minutes <= currentMinute)
      ) {
        return true;
      }
    }

    return false;
  };

  const handleDateChange = (newDate) => {
    if (!isPastDate(newDate)) {
      setDate(newDate);
    }
  };

  return (
    <div className="availability-page">
      <div className="page-header">
        <h1 className="page-title">Availability Management</h1>
        <p className="page-subtitle">Set your available time slots</p>
      </div>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="availability-card">
            <h5 className="section-title">Select Date</h5>
            <div className="calendar-wrapper">
              <Calendar
                value={date}
                onChange={handleDateChange}
                minDate={new Date()}
                tileDisabled={({ date: tileDate }) => isPastDate(tileDate)}
                selectRange={false}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="availability-card">
            <h5 className="section-title">Time Slots for {formatDate(date)}</h5>

            {isPastDate(date) && (
              <div
                style={{
                  padding: "1rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#dc2626",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <strong>⚠️ Past Date:</strong> You cannot modify availability
                for past dates.
              </div>
            )}

            {loading ? (
              <div className="loading-text">Loading availability...</div>
            ) : (
              <div className="time-slots-list">
                {slots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isBlocked = blockedSlots.includes(slot);
                  const isPast = isPastTimeSlot(slot);

                  return (
                    <div className="time-slot-item" key={slot}>
                      <div className="time-slot-info">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="time-slot-time">
                          {formatTimeSlot(slot)}
                        </span>
                        {isBlocked && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              color: "#ef4444",
                            }}
                          >
                            (Blocked)
                          </span>
                        )}
                        {isPast && !isBlocked && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              color: "#9ca3af",
                            }}
                          >
                            (Past)
                          </span>
                        )}
                      </div>
                      <button
                        className={`btn-slot ${isAvailable ? "available" : ""} ${isPast ? "disabled" : ""}`}
                        onClick={() => toggleSlot(slot)}
                        disabled={toggling === slot || isPast}
                        style={
                          isPast ? { cursor: "not-allowed", opacity: 0.5 } : {}
                        }
                      >
                        {toggling === slot
                          ? "Updating..."
                          : isAvailable
                            ? "Available"
                            : isBlocked
                              ? "Unblock & Set Available"
                              : "Set Available"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="quick-actions-box">
              <h6 className="quick-actions-title">Quick Actions</h6>
              <div className="quick-actions-buttons">
                <button
                  className="btn-action"
                  onClick={handleBlockDay}
                  disabled={isPastDate(date)}
                  style={
                    isPastDate(date)
                      ? { cursor: "not-allowed", opacity: 0.5 }
                      : {}
                  }
                >
                  Block Day
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Availability;
