import { getMentorId } from "../../../service/authService";
import ChatModal from "../../../Component/MentorComponents/ChatModal/ChatModal";
import "./MentorMessages.css";

function MentorMessages() {
  const mentorId = getMentorId();

  return (
    <div className="mentor-messages-page">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">
          Chat with your students — new messages appear automatically
        </p>
      </div>

      <ChatModal
        isOpen={true}
        embedded={true}
        onClose={() => {}}
        userId={mentorId}
        mentorId={mentorId}
      />
    </div>
  );
}

export default MentorMessages;
