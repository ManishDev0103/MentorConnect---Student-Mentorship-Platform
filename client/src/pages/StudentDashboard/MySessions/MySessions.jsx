import React, { useState, useEffect } from "react";
import "./MySessions.css";
import {
  getStudentSessions,
  cancelSession,
} from "../../../service/studentservice";
import { resolveStudentId } from "../../../service/authService";
import { createOrder, verifyPayment } from "../../../service/paymentService";
import ScheduleSessionModal from "../../../Component/ScheduleSessionModal/ScheduleSessionModal";
import { generateMeetingLink } from "../../../utils/meetingLink";

const MySessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payingSessionId, setPayingSessionId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const studentId = await resolveStudentId();

      if (!studentId) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await getStudentSessions(studentId);
      const sessions = response.data || [];

      // Separate upcoming and past sessions
      const now = new Date();
      const upcoming = [];
      const past = [];

      const normalizeStatus = (status) => String(status || "").toUpperCase();
      const isCancelledStatus = (status) =>
        ["CANCELLED", "CANCELLED_BY_STUDENT", "CANCELLED_BY_MENTOR"].includes(
          normalizeStatus(status),
        );

      const normalizeStatusLabel = (status) => {
        if (isCancelledStatus(status)) return "CANCELLED";
        return status;
      };

      sessions.forEach((session) => {
        // Construct a precise Date object for the session
        // session.sessionDate is YYYY-MM-DD, session.startTime is HH:MM:SS
        const sessionDateTime = new Date(
          `${session.sessionDate}T${session.startTime}`,
        );
        const sessionDate = new Date(session.sessionDate);

        const sessionObj = {
          sessionId: session.sessionId,
          mentorId: session.mentorId, // Added mentorId
          title: session.topic,
          mentor: session.mentorName,
          date: sessionDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: session.startTime,
          duration: calculateDuration(session.startTime, session.endTime),
          status: normalizeStatusLabel(session.status),
          originalStatus: session.status,
          fee: session.sessionFee,
          description: session.description,
          meetingUrl: generateMeetingLink(
            session.mentorId,
            session.sessionDate,
            session.startTime,
          ),
        };

        // Categorize sessions
        const sessionStatus = normalizeStatus(session.status);

        if (isCancelledStatus(sessionStatus)) {
          // Cancelled sessions go to past sessions
          past.push(sessionObj);
        } else if (
          sessionStatus === "PAYMENT_PENDING" ||
          sessionStatus === "SCHEDULED" ||
          (sessionDateTime > now && sessionStatus !== "COMPLETED")
        ) {
          // Keep active bookings visible even when their scheduled time has passed.
          upcoming.push(sessionObj);
        } else {
          // Completed or past sessions go to past
          past.push(sessionObj);
        }
      });

      // Sort by date
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      setUpcomingSessions(upcoming);
      setPastSessions(past);
      setError(null);
    } catch (err) {
      console.warn("Error fetching sessions:", err);
      setUpcomingSessions([]);
      setPastSessions([]);
      setError("Unable to load sessions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const start = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;

      const duration = end - start;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch {
      return "N/A";
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) {
      return;
    }

    try {
      setLoading(true);
      await cancelSession(sessionId);
      alert("Session cancelled successfully");
      // Force refresh sessions with a small delay to ensure backend has processed
      setTimeout(() => {
        fetchSessions();
      }, 500);
    } catch (err) {
      console.error("Error cancelling session:", err);
      setError(err.response?.data?.message || "Failed to cancel session");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (session) => {
    if (!window.Razorpay) {
      setError("Payment SDK not loaded. Please refresh the page and try again.");
      return;
    }

    try {
      setPayingSessionId(session.sessionId);
      setError(null);
      const studentId = await resolveStudentId();
      if (!studentId) throw new Error("Student ID not found. Please log in again.");

      const orderResponse = await createOrder(
        studentId,
        1,
        session.fee,
        session.sessionId,
      );
      const order = orderResponse.data;
      if (!order?.orderId || !order?.razorpayKey) {
        throw new Error("Payment order was not created.");
      }

      const razorpay = new window.Razorpay({
        key: order.razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Mentorship Session",
        description: `Session with ${session.mentor}`,
        order_id: order.orderId,
        handler: async (paymentResponse) => {
          try {
            await verifyPayment({
              studentId,
              planId: 1,
              amount: session.fee,
              razorpayOrderId: order.orderId,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              sessionId: session.sessionId,
            });
            alert("Payment successful. Your session is now scheduled.");
            await fetchSessions();
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
                "Payment verification failed. Please contact support.",
            );
          } finally {
            setPayingSessionId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingSessionId(null),
        },
        theme: { color: "#2563eb" },
      });
      razorpay.open();
    } catch (paymentError) {
      setPayingSessionId(null);
      setError(paymentError.response?.data?.message || paymentError.message || "Unable to start payment.");
    }
  };

  const renderPaymentAction = (session) => (
    session.originalStatus === "PAYMENT_PENDING" && (
      <button
        className="session-pay-btn"
        onClick={() => handleRetryPayment(session)}
        disabled={payingSessionId === session.sessionId}
      >
        {payingSessionId === session.sessionId ? "Opening..." : "Pay Now"}
      </button>
    )
  );

  if (loading) {
    return (
      <div className="my-sessions-page">
        <h2>My Sessions</h2>
        <p>Loading your sessions...</p>
      </div>
    );
  }

  // Calculate filterMentorIds
  // Calculate filterMentorIds
  // Collect unique mentor IDs ONLY from UPCOMING active sessions
  // This matches the "Your Mentors" logic which only shows active mentors
  // Users must browse verified mentors to re-book past/completed mentors if they are no longer active
  // Calculate filterMentorIds
  // Collect unique mentor IDs ONLY from UPCOMING active sessions
  const upcomingMentorIds = [...new Set(upcomingSessions.map((s) => s.mentorId))];
  // If no upcoming sessions, pass null so modal shows ALL mentors (Pay Per Session flow)
  const filterMentorIds = upcomingMentorIds.length > 0 ? upcomingMentorIds : null;

  return (
    <div className="my-sessions-page">
      <h2>My Sessions</h2>
      <p>View and manage your mentorship sessions</p>

      <ScheduleSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionScheduled={fetchSessions}
        filterMentorIds={filterMentorIds}
      />

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchSessions}>Retry</button>
        </div>
      )}

      <div className="sessions-main-content">
        <div className="sessions-card">
          <div className="sessions-header">
            <span>Booked Sessions ({upcomingSessions.length})</span>
            <button
              className="schedule-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <span role="img" aria-label="calendar">
                📅
              </span>{" "}
              Schedule New
            </button>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No booked sessions yet</p>
              <p className="text-muted">
                Book a session with a mentor to get started
              </p>
            </div>
          ) : (
            upcomingSessions.map((session, idx) => (
              <div className="session-row" key={session.sessionId || idx}>
                <div className="session-row-content">
                  <div className="session-title">{session.title}</div>
                  <div className="session-info">
                    <span>{session.mentor}</span>
                    <span>•</span>
                    <span>{session.date}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                    <span>•</span>
                    <span>Duration: {session.duration}</span>
                  </div>
                  <div className="session-status">
                    <span
                      className={
                        session.status === "SCHEDULED"
                          ? "status-confirmed"
                          : session.status === "COMPLETED"
                            ? "status-completed"
                            : session.status === "CANCELLED"
                              ? "status-cancelled"
                              : "status-pending"
                      }
                    >
                      {session.status}
                    </span>
                    {renderPaymentAction(session)}
                    <button
                      className="session-cancel-btn"
                      onClick={() => handleCancelSession(session.sessionId)}
                      title="Cancel Session"
                    >
                      <span role="img" aria-label="cancel">
                        ❌
                      </span>
                    </button>
                  </div>
                </div>
                {/* Display Zoom Link if available */}
                {session.meetingUrl && (
                  <div
                    className="session-join-link"
                    style={{
                      width: "100%",
                      paddingTop: "8px",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#64748b",
                        marginRight: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        role="img"
                        aria-label="camera"
                        style={{ fontSize: "16px" }}
                      >
                        🎥
                      </span>
                      Join Meeting:
                    </span>
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {session.meetingUrl}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="sessions-card">
          <div className="sessions-header">
            Past Sessions ({pastSessions.length})
          </div>
          {pastSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No past sessions</p>
            </div>
          ) : (
            pastSessions.map((session, idx) => (
              <div className="session-row" key={session.sessionId || idx}>
                <div className="session-title">{session.title}</div>
                <div className="session-info">
                  <span>{session.mentor}</span>
                  <span>•</span>
                  <span>{session.date}</span>
                  <span>•</span>
                  <span>{session.time}</span>
                </div>
                <div className="session-status">
                  <span
                    className={
                      session.status === "COMPLETED"
                        ? "status-completed"
                        : session.status === "CANCELLED"
                          ? "status-cancelled"
                          : "status-pending"
                    }
                  >
                    {session.status}
                  </span>
                  <span className="session-fee">₹{session.fee}</span>
                  {renderPaymentAction(session)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MySessions;
