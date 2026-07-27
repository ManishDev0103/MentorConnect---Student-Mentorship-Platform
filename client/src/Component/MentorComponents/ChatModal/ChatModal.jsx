import React, { useState, useEffect, useRef } from "react";
import "./ChatModal.css";
import {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  getMentorConversations,
  getMyStudents,
} from "../../../service/mentorService";

const ChatModal = ({ isOpen, onClose, userId, mentorId }) => {
  const [conversations, setConversations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);
  const conversationPollingInterval = useRef(null);

  console.log("ChatModal - Received mentorId:", mentorId);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations on mount
  useEffect(() => {
    if (isOpen && mentorId) {
      loadConversations();

      // Start polling conversation list every 5 seconds to catch new messages
      conversationPollingInterval.current = setInterval(() => {
        loadConversations();
      }, 5000);
    }

    return () => {
      if (conversationPollingInterval.current) {
        clearInterval(conversationPollingInterval.current);
      }
    };
  }, [isOpen, mentorId]);

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (selectedStudent) {
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
  }, [selectedStudent]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);

      console.log("ChatModal.loadConversations - Using mentorId:", mentorId);

      // Validate mentorId
      if (!mentorId) {
        console.error("ChatModal - mentorId is not set!");
        setLoading(false);
        return;
      }

      // Load all students and existing conversations in parallel
      // Use userId for getMyStudents (API expects userId), mentorId for conversations
      const [studentsResponse, conversationsResponse] = await Promise.all([
        getMyStudents(userId || mentorId),
        getMentorConversations(mentorId),
      ]);

      console.log("Students response:", studentsResponse);
      console.log("Conversations response:", conversationsResponse);

      // Get all students
      const students = studentsResponse.success ? studentsResponse.data : [];
      setAllStudents(students);

      // Get existing conversations
      const existingConversations = conversationsResponse.data.success
        ? conversationsResponse.data.data
        : [];

      console.log(
        "📊 Existing conversations with unread counts:",
        existingConversations,
      );

      // Create a map of students with conversation data
      const conversationMap = new Map();
      existingConversations.forEach((conv) => {
        console.log(
          `📧 Student ${conv.studentName}: unreadCount = ${conv.unreadCount}`,
        );
        conversationMap.set(conv.studentId, conv);
      });

      // Merge all students with conversation data
      const mergedConversations = students.map((student) => {
        const existingConv = conversationMap.get(student.studentId);
        const conversation = {
          studentId: student.studentId,
          studentName: student.name,
          lastMessage: existingConv?.lastMessage || "No messages yet",
          lastMessageTime: existingConv?.lastMessageTime || "",
          unreadCount: existingConv?.unreadCount || 0,
        };

        if (conversation.unreadCount > 0) {
          console.log(
            `🔵 UNREAD: ${conversation.studentName} has ${conversation.unreadCount} unread messages`,
          );
        }

        return conversation;
      });

      console.log("Merged conversations:", mergedConversations);
      setConversations(mergedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!selectedStudent) return;

    try {
      if (!silent) setLoading(true);
      const response = await getConversation(
        mentorId,
        selectedStudent.studentId,
      );
      if (response.data.success) {
        const fetchedMessages = response.data.data;

        // Check for new messages (only if not initial load)
        if (
          silent &&
          messages.length > 0 &&
          fetchedMessages.length > messages.length
        ) {
          // New message received - show notification and refresh conversation list
          console.log(
            "📩 New message received from",
            selectedStudent.studentName,
          );
          loadConversations(); // Refresh to update last message
          // You can add a toast notification here if you have a notification library
        }

        setMessages(fetchedMessages);

        // Mark messages as read ONLY on initial load (not during polling)
        if (!silent) {
          await markMessagesAsRead(mentorId, selectedStudent.studentId);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const messageData = {
        mentorId: mentorId,
        studentId: selectedStudent.studentId,
        content: newMessage.trim(),
        senderType: "MENTOR",
      };

      console.log("Sending message with data:", messageData);
      const response = await sendMessage(messageData);
      if (response.data.success) {
        setNewMessage("");
        loadMessages(true); // Reload messages silently

        // Mark messages as read since user is actively in the conversation
        await markMessagesAsRead(mentorId, selectedStudent.studentId);

        loadConversations(); // Update conversation list
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>Messages</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {!selectedStudent ? (
          // Conversations List
          <div className="chat-conversations">
            {loading ? (
              <div className="loading">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.studentId}
                  className={`conversation-item ${conv.unreadCount > 0 ? "has-unread" : ""}`}
                  onClick={() => handleSelectStudent(conv)}
                >
                  <div className="conversation-header">
                    <span
                      className={`student-name ${conv.unreadCount > 0 ? "unread-name" : ""}`}
                    >
                      {conv.studentName}
                    </span>
                    <div className="conversation-right">
                      <span className="conversation-time">
                        {conv.lastMessageTime}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="unread-count-badge">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`last-message ${!conv.lastMessageTime ? "no-messages" : ""} ${conv.unreadCount > 0 ? "unread-message" : ""}`}
                  >
                    {conv.lastMessage}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Messages View
          <div className="chat-messages-container">
            <div className="chat-messages-header">
              <button
                className="back-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ← Back
              </button>
              <h4>{selectedStudent.studentName}</h4>
            </div>

            <div className="chat-messages">
              {loading && messages.length === 0 ? (
                <div className="loading">Loading messages...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`message ${msg.senderType === "MENTOR" ? "sent" : "received"} ${
                      msg.senderType !== "MENTOR" && !msg.isRead ? "unread" : ""
                    }`}
                  >
                    <div className="message-bubble">
                      {msg.content}
                      {msg.senderType !== "MENTOR" && !msg.isRead && (
                        <span className="new-message-badge"> • NEW</span>
                      )}
                    </div>
                    <div className="message-time">
                      {formatTime(msg.sentAt)}
                      {msg.senderType !== "MENTOR" && msg.isRead && (
                        <span className="read-indicator"> ✓✓</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
