import React, { useState, useEffect, useRef } from "react";
import "./StudyTimer.css";
import {
  startStudySession,
  stopStudySession,
  getStudyHistory,
  deleteStudySession,
} from "../../../service/studentservice";
import { getStudentId } from "../../../service/authService";

const StudyTimer = () => {
  const [taskName, setTaskName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    // Cleanup timer on unmount
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const studentId = getStudentId();
      const response = await getStudyHistory(studentId);
      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!taskName.trim()) {
      alert("Please enter a task name first!");
      return;
    }

    try {
      const studentId = getStudentId();
      const response = await startStudySession(studentId, taskName);

      setCurrentSessionId(response.data.id);
      setIsRunning(true);
      setElapsedTime(0);

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting timer:", error);
      alert("Failed to start timer.");
    }
  };

  const handleStop = async () => {
    if (!currentSessionId) return;

    try {
      await stopStudySession(currentSessionId);

      clearInterval(timerRef.current);
      setIsRunning(false);
      setCurrentSessionId(null);
      setTaskName(""); // Reset task name

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error("Error stopping timer:", error);
      alert("Failed to stop timer.");
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session log?"))
      return;

    try {
      await deleteStudySession(sessionId);
      fetchHistory(); // Refresh list
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session");
    }
  };

  // Safe duration display for history
  const getDurationDisplay = (minutes) => {
    if (minutes === 0) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="study-timer-container">
      <div className="timer-card">
        <h2>⏱️ Study Timer</h2>
        <p className="timer-subtitle">Track your learning progress</p>

        <div className="timer-display">{formatTime(elapsedTime)}</div>

        <div className="timer-controls">
          <input
            type="text"
            placeholder="What are you studying?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            disabled={isRunning}
            className="task-input"
          />

          {!isRunning ? (
            <button className="btn-start" onClick={handleStart}>
              ▶ Start Session
            </button>
          ) : (
            <button className="btn-stop" onClick={handleStop}>
              ⏹ Stop Session
            </button>
          )}
        </div>
      </div>

      <div className="history-card">
        <h3>Recent Sessions</h3>
        {loadingHistory ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p className="no-history">No study sessions recorded yet.</p>
        ) : (
          <div className="history-list">
            <div className="history-header">
              <span>Task</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {history.map((session) => (
              <div key={session.id} className="history-row">
                <span className="history-task">{session.taskName}</span>
                <span className="history-date">
                  {new Date(session.startTime).toLocaleDateString()}{" "}
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="history-duration">
                  {session.status === "COMPLETED"
                    ? getDurationDisplay(session.durationMinutes)
                    : "..."}
                </span>
                <span
                  className={`status-badge ${session.status.toLowerCase()}`}
                >
                  {session.status}
                </span>
                <button
                  className="btn-delete-session"
                  onClick={() => handleDelete(session.id)}
                  title="Delete Log"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
