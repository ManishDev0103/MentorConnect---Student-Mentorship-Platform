import React, { useState, useEffect, useRef } from "react";
import "./StudentChatModal.css";
import {
  sendMessageToMentor,
  getConversationWithMentor,
  markMessagesAsReadByStudent,
  getStudentConversations,
  getVerifiedMentors,
  getStudentSessions,
} from "../../../service/studentservice";

const StudentChatModal = ({ isOpen, onClose, studentId }) => {
  const [conversations, setConversations] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);
  const conversationPollingInterval = useRef(null);

  console.log("StudentChatModal - Received studentId:", studentId);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations on mount
  useEffect(() => {
    if (isOpen && studentId) {
      loadConversations();

      // Start polling conversation list every 5 seconds to catch new messages from mentors
      conversationPollingInterval.current = setInterval(() => {
        loadConversations();
      }, 5000);
    }

    return () => {
      if (conversationPollingInterval.current) {
        clearInterval(conversationPollingInterval.current);
      }
    };
  }, [isOpen, studentId]);

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (selectedMentor) {
      loadMessages();

      // Start polling every 3 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(true);
      }, 3000);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [selectedMentor]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);

      console.log(
        "StudentChatModal.loadConversations - Using studentId:",
        studentId,
      );

      if (!studentId) {
        console.error("StudentChatModal - studentId is not set!");
        setLoading(false);
        return;
      }

      // Load verified mentors, existing conversations, and sessions in parallel
      const [mentorsResponse, conversationsResponse, sessionsResponse] = await Promise.all([
        getVerifiedMentors(studentId),
        getStudentConversations(studentId),
        getStudentSessions(studentId),
      ]);

      console.log("Mentors response:", mentorsResponse);
      console.log("Conversations response:", conversationsResponse);
      console.log("Sessions response:", sessionsResponse);

      // Get verified mentors (may be empty)
      const mentors = mentorsResponse?.data || [];

      // Get mentors from student's sessions (booked mentors)
      const sessions = sessionsResponse?.data || [];
      const mentorsFromSessions = sessions
        .map((s) => ({ mentorId: s.mentorId, mentorName: s.mentorName, booked: true }))
        .filter((m) => m && m.mentorId);

      // Merge mentors lists and dedupe by mentorId
      const mentorMap = new Map();
      mentors.forEach((m) => mentorMap.set(m.mentorId, { mentorId: m.mentorId, mentorName: m.name, booked: false }));
      mentorsFromSessions.forEach((m) => {
        if (mentorMap.has(m.mentorId)) {
          mentorMap.set(m.mentorId, { ...mentorMap.get(m.mentorId), booked: true });
        } else {
          mentorMap.set(m.mentorId, { mentorId: m.mentorId, mentorName: m.mentorName || "Mentor", booked: true });
        }
      });

      const mergedMentors = Array.from(mentorMap.values());
      setAllMentors(mergedMentors);

      // Get existing conversations
      const existingConversations = conversationsResponse?.data?.data || [];

      const mergedMap = new Map();

      mergedMentors.forEach((mentor) => {
        mergedMap.set(mentor.mentorId, {
          mentorId: mentor.mentorId,
          mentorName: mentor.mentorName || mentor.name || "Mentor",
          lastMessage: "No messages yet",
          lastMessageTime: "",
          unreadCount: 0,
          booked: mentor.booked || false,
        });
      });

      existingConversations.forEach((conv) => {
        mergedMap.set(conv.mentorId, {
          mentorId: conv.mentorId,
          mentorName:
            conv.mentorName ||
            mergedMap.get(conv.mentorId)?.mentorName ||
            "Mentor",
          lastMessage: conv.lastMessage || "No messages yet",
          lastMessageTime: conv.lastMessageTime || "",
          unreadCount: conv.unreadCount || 0,
          booked: mergedMap.get(conv.mentorId)?.booked || false,
        });
      });

      const mergedConversations = Array.from(mergedMap.values());

      console.log("Merged conversations:", mergedConversations);
      setConversations(mergedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!selectedMentor) return;

    try {
      if (!silent) setLoading(true);

      const response = await getConversationWithMentor(
        studentId,
        selectedMentor.mentorId,
      );
      console.log("Messages response:", response);

      const fetchedMessages = response.data?.data || [];

      // Check for new messages (only if not initial load)
      if (
        silent &&
        messages.length > 0 &&
        fetchedMessages.length > messages.length
      ) {
        // New message received - show notification and refresh conversation list
        console.log("📩 New message received from", selectedMentor.mentorName);
        loadConversations(); // Refresh to update last message
        // You can add a toast notification here if you have a notification library
      }

      setMessages(fetchedMessages);

      // Mark messages as read ONLY on initial load (not during polling)
      if (!silent && fetchedMessages.length > 0) {
        await markMessagesAsReadByStudent(studentId, selectedMentor.mentorId);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectMentor = (mentor) => {
    console.log("Selected mentor:", mentor);
    setSelectedMentor(mentor);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedMentor) return;

    try {
      const response = await sendMessageToMentor({
        studentId,
        mentorId: selectedMentor.mentorId,
        content: newMessage.trim(),
        senderType: "STUDENT",
      });

      console.log("Message sent:", response);

      // Clear input
      setNewMessage("");

      // Reload messages immediately
      await loadMessages(true);

      // Don't mark messages as read after sending - only mark when viewing/opening
      // This allows the mentor to see the unread count for student messages

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.mentorId === selectedMentor.mentorId
            ? {
                ...conv,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleBackToList = () => {
    setSelectedMentor(null);
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div
        className="chat-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="chat-modal-header">
          <h2>💬 Chat with Mentors</h2>
          <button className="chat-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="chat-modal-content">
          {/* Conversations List */}
          {!selectedMentor && (
            <div className="conversations-list">
              {loading ? (
                <div className="chat-loading">Loading mentors...</div>
              ) : conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>
                    No mentors found. Browse and book sessions with mentors to
                    start chatting!
                  </p>
                </div>
              ) : (
                <>
                  <div className="conversations-header">
                    <h3>Your Mentors ({conversations.length})</h3>
                  </div>
                  {conversations.map((conv) => (
                    <div
                      key={conv.mentorId}
                      className={`conversation-item ${conv.unreadCount > 0 ? "has-unread" : ""}`}
                      onClick={() => handleSelectMentor(conv)}
                    >
                      <div className="conversation-avatar">
                        {conv.mentorName.charAt(0)}
                      </div>
                      <div className="conversation-info">
                        <div
                          className={`conversation-name ${conv.unreadCount > 0 ? "unread-name" : ""}`}
                        >
                          {conv.mentorName}
                          {conv.booked && (
                            <span className="conversation-booked-label">Booked</span>
                          )}
                        </div>
                        <div
                          className={`conversation-last-message ${conv.unreadCount > 0 ? "unread-message" : ""}`}
                        >
                          {conv.lastMessage}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="conversation-unread-badge">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Chat View */}
          {selectedMentor && (
            <div className="chat-view">
              {/* Chat Header */}
              <div className="chat-header">
                <button className="back-btn" onClick={handleBackToList}>
                  ← Back
                </button>
                <div className="chat-mentor-info">
                  <div className="chat-avatar">
                    {selectedMentor.mentorName.charAt(0)}
                  </div>
                  <div>
                    <div className="chat-mentor-name">
                      {selectedMentor.mentorName}
                    </div>
                    <div className="chat-mentor-status">Mentor</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {loading && messages.length === 0 ? (
                  <div className="chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`message ${
                        message.senderType === "STUDENT" ? "sent" : "received"
                      } ${message.senderType !== "STUDENT" && !message.isRead ? "unread" : ""}`}
                    >
                      <div className="message-content">
                        {message.content}
                        {message.senderType !== "STUDENT" &&
                          !message.isRead && (
                            <span className="new-message-badge"> • NEW</span>
                          )}
                      </div>
                      <div className="message-time">
                        {new Date(message.sentAt || message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {message.senderType !== "STUDENT" && message.isRead && (
                          <span className="read-indicator"> ✓✓</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                className="message-input-container"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="message-input"
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentChatModal;
