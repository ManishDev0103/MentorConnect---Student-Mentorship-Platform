import "./StudentCard.css";
import { useNavigate } from "react-router-dom";
import { downloadStudentResume } from "../../../service/mentorservice";

export default function StudentCard({ data, onChatClick }) {
  const navigate = useNavigate();
  
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="student-card">
        <div className="student-header">
          <div className="student-avatar">
            <img src={data.avatar || `https://i.pravatar.cc/100?u=${data.name}`} alt={data.name} />
          </div>
          <div className="student-info">
            <div className="student-name">{data.name}</div>
            <div className="student-sessions">{data.sessions} sessions</div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-value">{data.progress}%</span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ width: `${data.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="next-session-box">
          <div className="next-session-label">Next Session</div>
          <div className="next-session-time">
            {data.nextSession || "No upcoming session"}
          </div>
        </div>

        <div className="student-actions">
          <button className="btn btn-chat" onClick={onChatClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat
          </button>
          <button 
            className="btn btn-mcq"
            onClick={() => navigate(`/mentor/mcq-practice/${data.studentId}`)}
          >
            📝 MCQ
          </button>
          {data.resumeAvailable && (
            <button
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  const blob = await downloadStudentResume(data.mentorId, data.studentId);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = data.name?.replace(/\s+/g, '_') + '_CV';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Unable to download CV:', error);
                }
              }}
            >
              📄 View CV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
