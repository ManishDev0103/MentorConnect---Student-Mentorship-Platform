import { useState, useEffect } from "react";
import "./MyStudents.css";
import "../../../styles/common.css";
import StudentCard from "../../../Component/MentorComponents/StudentCard/StudentCard";
import ChatModal from "../../../Component/MentorComponents/ChatModal/ChatModal";
import { getMyStudents } from "../../../service/mentorService";
import { handleApiError } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get mentor ID from localStorage (set during login)
  const mentorId = getMentorId();

  console.log("MyStudents - Using mentorId:", mentorId);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getMyStudents(mentorId);

      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (error) {
      handleApiError(error, "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-students-page">
      <div className="page-header">
        <h1 className="page-title">My Students</h1>
        <p className="page-subtitle">View and manage your assigned students</p>
      </div>

      {loading ? (
        <div className="loading-text">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>No students assigned yet</p>
        </div>
      ) : (
        <div className="row">
          {students.map((student, index) => (
            <StudentCard
              key={index}
              data={student}
              onChatClick={() => setIsChatOpen(true)}
            />
          ))}
        </div>
      )}

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userId={mentorId}
        mentorId={mentorId}
      />
    </div>
  );
}

export default MyStudents;
