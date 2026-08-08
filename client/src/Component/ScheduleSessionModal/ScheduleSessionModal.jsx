import React, { useState, useEffect } from "react";
import "../Modal.css"; // Using a standard modal CSS
import { bookSession, deleteSession, getVerifiedMentors, getMentorDetails } from "../../service/studentservice";
import { resolveStudentId } from "../../service/authService";
import { createOrder, verifyPayment } from "../../service/paymentService";
import { getAvailabilityForDate } from "../../service/mentorservice";
import { useDarkMode } from "../../context/DarkModeContext";

const ScheduleSessionModal = ({
  isOpen,
  onClose,
  onSessionScheduled,
  preselectedMentorId = null,
  filterMentorIds = null,
}) => {
  const { isDarkMode } = useDarkMode();
  const [mentors, setMentors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    mentorId: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    topic: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  const getDisabledInputStyle = () => ({
    backgroundColor: isDarkMode ? "rgba(148, 163, 184, 0.12)" : "#e9ecef",
    cursor: "not-allowed",
  });

  useEffect(() => {
    if (isOpen) {
      fetchMentors();
      resetForm();
    }
  }, [isOpen]);

  // Update form data when preselectedMentorId changes or modal opens
  useEffect(() => {
    if (isOpen && preselectedMentorId) {
      setFormData((prev) => ({
        ...prev,
        mentorId: preselectedMentorId,
      }));
    }
  }, [isOpen, preselectedMentorId]);

  const fetchMentors = async () => {
    try {
      setMentorLoading(true);
      const studentId = await resolveStudentId();

      if (preselectedMentorId && preselectedMentorId !== "null") {
        // If specific mentor selected (e.g. from public listing), fetch just that one
        // This avoids the issue where "getVerifiedMentors" only returns *my* mentors
        const response = await getMentorDetails(preselectedMentorId);
        if (response.data) {
          setMentors([response.data]);
        }
      } else {
        // Otherwise load all "my" mentors (dashboard flow)
        const response = await getVerifiedMentors(studentId);
        setMentors(response.data || []);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching mentors:", err);
      // If we have a preselected mentor, we might not strictly need the full list if the ID matches
      // but it's good to have for validation or displaying the name.
      setError("Failed to load mentors. Please try again.");
    } finally {
      setMentorLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mentorId: "",
      sessionDate: "",
      startTime: "",
      endTime: "",
      topic: "",
      description: "",
    });
    setAvailableSlots([]);
    setError("");
  };

  // Fetch available slots when mentor and date are selected
  const fetchAvailableSlots = async (mentorId, date) => {
    if (!mentorId || !date) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");
      const response = await getAvailabilityForDate(mentorId, date);

      if (response.success && response.data) {
        // Filter for available slots that are not booked or blocked
        const available = response.data.timeSlots
          .filter((slot) => slot.available && !slot.booked && !slot.blocked)
          .map((slot) => slot.timeSlot);

        setAvailableSlots(available);

        if (available.length === 0) {
          setError(
            "No available time slots for this date. Please select another date.",
          );
        }
      } else {
        setAvailableSlots([]);
        setError(
          "No availability set for this date. Please select another date.",
        );
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailableSlots([]);
      setError("Failed to load available slots. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // When mentor or date changes, fetch available slots
    if (name === "mentorId" || name === "sessionDate") {
      const newMentorId = name === "mentorId" ? value : formData.mentorId;
      const newDate = name === "sessionDate" ? value : formData.sessionDate;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        startTime: "", // Reset time when mentor or date changes
        endTime: "",
      }));

      if (newMentorId && newDate) {
        fetchAvailableSlots(newMentorId, newDate);
      } else {
        setAvailableSlots([]);
      }
    }
    // If start time is changed, automatically calculate end time (1 hour later)
    else if (name === "startTime" && value) {
      const [hours, minutes] = value.split(":");
      const startDate = new Date();
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Add 1 hour
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const endTime = `${endHours}:${endMinutes}`;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endTime: endTime,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.mentorId) {
      setError("Please select a mentor");
      return false;
    }
    if (!formData.sessionDate) {
      setError("Please select a session date");
      return false;
    }
    if (!formData.startTime) {
      setError("Please select a start time");
      return false;
    }
    if (!formData.topic) {
      setError("Please enter a topic");
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Session date cannot be in the past");
      return false;
    }

    return true;
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let pendingSessionId = null;

    try {
      setLoading(true);
      setError("");

      const studentId = await resolveStudentId();
      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        return;
      }

      // Check for Razorpay SDK
      if (!window.Razorpay) {
        setError("Payment SDK not loaded.");
        return;
      }

      const selectedMentor = mentors.find(
        (m) => m.mentorId == formData.mentorId,
      );
      const sessionFee = selectedMentor ? (selectedMentor.finalPrice ?? selectedMentor.ratePerSession) : 0;

      // Re-check immediately before booking because another student may have taken the slot.
      const latestAvailability = await getAvailabilityForDate(
        formData.mentorId,
        formData.sessionDate,
      );
      const latestSlots = latestAvailability?.data?.timeSlots || [];
      const selectedSlot = latestSlots.find((slot) =>
        String(slot.timeSlot).startsWith(formData.startTime),
      );
      if (!selectedSlot || !selectedSlot.available || selectedSlot.booked || selectedSlot.blocked) {
        const refreshedSlots = latestSlots
          .filter((slot) => slot.available && !slot.booked && !slot.blocked)
          .map((slot) => slot.timeSlot);
        setAvailableSlots(refreshedSlots);
        setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
        setError("That time slot is no longer available. Please choose another slot.");
        return;
      }

      const sessionData = {
        mentorId: parseInt(formData.mentorId),
        sessionDate: formData.sessionDate,
        startTime: formData.startTime + ":00", // Add seconds for backend time format matching
        // endTime will be auto-calculated by backend (1 hour from startTime)
        topic: formData.topic,
        description: formData.description || "",
      };
      // include computed session fee so backend and order creation match
      sessionData.sessionFee = sessionFee;

      // 1. Create Session (Status: PAYMENT_PENDING)
      const bookingResponse = await bookSession(studentId, sessionData);
      const newSessionId = bookingResponse.data.sessionId;
      pendingSessionId = newSessionId;

      if (!newSessionId) {
        throw new Error("Failed to generate session ID");
      }

      // 2. Create Razorpay Order
      // Passing planId=1 (Pay Per Session) for reference, but amount is dynamic
      const orderRes = await createOrder(
        studentId,
        1,
        sessionFee,
        newSessionId,
      );

      const orderData = orderRes.data;

      // 3. Open Razorpay
      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount, // in paise
        currency: "INR",
        name: "Mentorship Session",
        description: `Session with ${selectedMentor?.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 4. Verify Payment
            await verifyPayment({
              studentId,
              planId: 1,
              amount: sessionFee,
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              sessionId: newSessionId,
            });

            // Success!
            alert(
              `✅ Payment Successful! Session Scheduled.\n\nCheck 'My Sessions' for details.`,
            );
            onSessionScheduled();
            onClose();
          } catch (err) {
            console.error("Payment Verification Failed:", err);
            alert("❌ Payment Verification Failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async function () {
            // Delete the pending session so it doesn't clutter the history
            try {
              if (newSessionId) {
                await deleteSession(newSessionId);
                console.log(
                  "Pending session deleted due to payment cancellation.",
                );
              }
            } catch (delErr) {
              console.warn("Failed to delete pending session:", delErr);
            }
            // Alert user
            alert("❌ Payment Cancelled. Session booking has been aborted.");
            onClose();
          },
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error scheduling session:", err);
      if (pendingSessionId) {
        try {
          await deleteSession(pendingSessionId);
        } catch (cleanupError) {
          console.warn("Unable to release pending session:", cleanupError);
        }
      }
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        "Failed to schedule session. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule New Session</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleScheduleSession}>
            {error && (
              <div className="form-error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label>Select Mentor *</label>

              <select
                name="mentorId"
                value={formData.mentorId}
                onChange={handleInputChange}
                disabled={mentorLoading || loading || !!preselectedMentorId}
                style={
                  preselectedMentorId
                    ? getDisabledInputStyle()
                    : {}
                }
              >
                <option value="">Choose a mentor...</option>
                {mentors
                  .filter((mentor) => {
                    // If filtered list is provided (even if empty), show only those
                    if (filterMentorIds !== null) {
                      return filterMentorIds.includes(mentor.mentorId);
                    }

                    // Otherwise show all
                    return true;
                  })
                  .map((mentor) => (
                    <option key={mentor.mentorId} value={mentor.mentorId}>
                      {mentor.name} - {mentor.domain || "General"}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Session Date *</label>
              <input
                type="date"
                name="sessionDate"
                value={formData.sessionDate}
                onChange={handleInputChange}
                disabled={loading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                {availableSlots.length > 0 ? (
                  <select
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={loading || loadingSlots}
                  >
                    <option value="">Choose available time...</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot.substring(0, 5)}>
                        {slot.substring(0, 5)} {/* Display HH:MM format */}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="startTime"
                    disabled
                    style={getDisabledInputStyle()}
                  >
                    <option value="">
                      {loadingSlots
                        ? "Loading slots..."
                        : formData.mentorId && formData.sessionDate
                          ? "No slots available"
                          : "Select mentor & date first"}
                    </option>
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>End Time * (Auto: Start + 1hr)</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  readOnly
                  disabled
                  style={getDisabledInputStyle()}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Topic *</label>
              <input
                type="text"
                name="topic"
                placeholder="e.g., React Fundamentals"
                value={formData.topic}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                name="description"
                placeholder="Add any additional details about your session..."
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-schedule"
                disabled={loading || mentorLoading}
              >
                {loading
                  ? "Processing..."
                  : (() => {
                    const selectedMentor = mentors.find(
                      (m) => m.mentorId == formData.mentorId,
                    );
                    const fee =
                      selectedMentor?.finalPrice ??
                      selectedMentor?.ratePerSession ??
                      0;
                    return fee > 0
                      ? `Pay ₹${fee} & Schedule`
                      : "Schedule Session";
                  })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
