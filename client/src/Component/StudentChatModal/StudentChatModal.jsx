import React, { useState, useEffect, useRef } from "react";
import "./StudentChatModal.css";
import api from "../../service/api";
import {
  getConversationWithMentor,
  markMessagesAsReadByStudent,
} from "../../service/studentservice";

const StudentChatModal = ({ isOpen, onClose, studentId }) => {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const pollingInterval = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && studentId) {
      loadMentors();
    }

    // Cleanup polling on unmount or when modal closes
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isOpen, studentId]);

  // Poll for new messages when a mentor is selected
  useEffect(() => {
    if (selectedMentor && selectedMentor.mentorId && studentId) {
      // Load messages immediately using mentor's mentorId
      loadMessages(selectedMentor.mentorId);

      // Start polling every 3 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(selectedMentor.mentorId, true); // silent reload
      }, 3000);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [selectedMentor, studentId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      console.log("Loading mentors for studentId:", studentId);

      // Get student's mentors from sessions
      const response = await api.get(`/student/${studentId}/sessions`);
      console.log("Sessions response:", response);

      // Handle different response structures
      const sessions = response.data?.data || response.data || [];
      console.log("Sessions array:", sessions);

      if (!Array.isArray(sessions)) {
        console.error("Sessions is not an array:", sessions);
        setMentors([]);
        return;
      }

      // Extract unique mentors from sessions using mentorUserId from backend
      const uniqueMentors = [];
      const mentorIds = new Set();

      sessions.forEach((session) => {
        console.log("Processing session:", session);
        if (session.mentorId && !mentorIds.has(session.mentorId)) {
          mentorIds.add(session.mentorId);
          uniqueMentors.push({
            mentorId: session.mentorId,
            userId: session.mentorUserId, // Use mentorUserId from session response
            name: session.mentorName || "Unknown Mentor",
            lastMessage: "Start chatting...",
            unread: 0,
          });
        }
      });

      console.log("Unique mentors found:", uniqueMentors);
      setMentors(uniqueMentors);
    } catch (error) {
      console.error("Error loading mentors:", error);
      console.error("Error details:", error.response?.data);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const selectMentor = async (mentor) => {
    console.log("Selecting mentor:", mentor);
    setSelectedMentor(mentor);
    // Messages will be loaded by the useEffect hook
  };

  const loadMessages = async (mentorId, silent = false) => {
    try {
      if (!silent) {
        console.log(
          "Loading messages for mentorId:",
          mentorId,
          "studentId:",
          studentId,
        );
      }
      const response = await getConversationWithMentor(studentId, mentorId);
      if (!silent) {
        console.log("Messages response:", response);
      }
      const messagesData = response.data.data || [];
      if (!silent) {
        console.log("Messages loaded:", messagesData);
      }
      setMessages(messagesData);

      // Mark messages as read
      if (messagesData.length > 0) {
        await markMessagesAsReadByStudent(studentId, mentorId);
      }
    } catch (error) {
      if (!silent) {
        console.error("Error loading messages:", error);
      }
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMentor || !selectedMentor.mentorId)
      return;

    try {
      console.log("Sending message:", {
        studentId,
        mentorId: selectedMentor.mentorId,
        content: newMessage,
      });
      const response = await api.post("/messages/send", {
        studentId: studentId,
        mentorId: selectedMentor.mentorId,
        content: newMessage,
        senderType: "STUDENT",
      });
      console.log("Message sent response:", response);

      setNewMessage("");
      // Reload messages immediately after sending using mentor's mentorId
      await loadMessages(selectedMentor.mentorId);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div
        className="chat-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-modal-header">
          <h3>💬 Chat with Mentors</h3>
          <button className="chat-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-modal-body">
          {/* Mentors List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h4>My Mentors</h4>
            </div>
            {loading ? (
              <div className="chat-loading">Loading mentors...</div>
            ) : mentors.length === 0 ? (
              <div className="chat-empty">
                <p>No mentors yet</p>
                <small>Book a session to start chatting</small>
              </div>
            ) : (
              <div className="chat-conversations-list">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.mentorId}
                    className={`chat-conversation-item ${selectedMentor?.mentorId === mentor.mentorId ? "active" : ""}`}
                    onClick={() => selectMentor(mentor)}
                  >
                    <div className="chat-avatar">👨‍🏫</div>
                    <div className="chat-conversation-info">
                      <div className="chat-conversation-name">
                        {mentor.name}
                      </div>
                      <div className="chat-conversation-preview">
                        {mentor.lastMessage}
                      </div>
                    </div>
                    {mentor.unread > 0 && (
                      <span className="chat-unread-badge">{mentor.unread}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {selectedMentor ? (
              <>
                <div className="chat-messages-header">
                  <div className="chat-avatar">👨‍🏫</div>
                  <div>
                    <div className="chat-header-name">
                      {selectedMentor.name}
                    </div>
                    <div className="chat-header-status">Mentor</div>
                  </div>
                </div>

                <div className="chat-messages-container">
                  {messages.length === 0 ? (
                    <div className="chat-empty-messages">
                      <p>No messages yet</p>
                      <small>Start the conversation!</small>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.messageId}
                        className={`chat-message ${msg.senderType === "STUDENT" ? "sent" : "received"}`}
                      >
                        <div className="chat-message-content">
                          {msg.content}
                        </div>
                        <div className="chat-message-time">
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div ref={messagesEndRef} />
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="chat-no-selection">
                <p>Select a mentor to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChatModal;
