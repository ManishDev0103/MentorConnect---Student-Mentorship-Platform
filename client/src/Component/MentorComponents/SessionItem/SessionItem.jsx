import "./SessionItem.css";

export default function SessionItem({ time, student, topic }) {
  return (
    <div className="session-item">
      <div className="session-time-wrapper">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="session-time">{time}</span>
      </div>
      <div className="session-student">{student}</div>
      <div className="session-topic">{topic}</div>
    </div>
  );
}
