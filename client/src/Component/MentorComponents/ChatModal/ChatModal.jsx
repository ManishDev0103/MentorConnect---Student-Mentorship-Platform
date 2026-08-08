import React, { useState, useEffect, useRef } from "react";
import "./ChatModal.css";
import {
  getConversation,
  markMessagesAsRead,
  getMentorConversations,
  getMyStudents,
  uploadSessionNote,
} from "../../../service/mentorservice";
import { getStudentSessions } from "../../../service/studentservice";
import {
  connectChatSocket,
  subscribeToMessages,
  sendChatMessage,
  disconnectChatSocket,
} from "../../../utils/stompClient";

const ChatModal = ({ isOpen, onClose, mentorId, initialStudentId, embedded = false }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);
  const conversationPollingInterval = useRef(null);
  const socketConnectedRef = useRef(false);
  const subscriptionRef = useRef(null);
  const noteFileInputRef = useRef(null);

  console.log("ChatModal - Received mentorId:", mentorId);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStudent(null);
      setMessages([]);
    }
  }, [isOpen]);

  // Auto-select student when opened from a student card
  useEffect(() => {
    if (isOpen && initialStudentId && conversations.length > 0) {
      const student = conversations.find(
        (c) => Number(c.studentId) === Number(initialStudentId),
      );
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [isOpen, initialStudentId, conversations]);

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
    if (!selectedStudent) return;

    loadMessages();

    if (!socketConnectedRef.current) {
      connectChatSocket(
        () => {
          socketConnectedRef.current = true;
          const subscription = subscribeToMessages(mentorId, (payload) => {
            const incomingMessage = {
              ...payload,
              senderType: payload.senderType || "STUDENT",
            };
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.messageId === incomingMessage.messageId);
              if (exists) return prev;
              return [...prev, incomingMessage];
            });
            setConversations((prev) =>
              prev.map((conv) =>
                conv.studentId === incomingMessage.studentId
                  ? {
                      ...conv,
                      lastMessage: incomingMessage.content,
                      lastMessageTime: incomingMessage.sentAt || new Date().toISOString(),
                      unreadCount: incomingMessage.senderType === "STUDENT" ? (conv.unreadCount || 0) + 1 : conv.unreadCount || 0,
                    }
                  : conv,
              ),
            );
          });
          subscriptionRef.current = subscription;
        },
        () => {
          socketConnectedRef.current = false;
        },
        () => {
          socketConnectedRef.current = false;
        },
        () => {
          socketConnectedRef.current = false;
        },
      );
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedStudent, mentorId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredConversations(conversations);
      return;
    }

    setFilteredConversations(
      conversations.filter(
        (conv) =>
          conv.studentName.toLowerCase().includes(query) ||
          (conv.lastMessage || "").toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, conversations]);

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

      // Load assigned students and existing conversations in parallel
      // getMyStudents expects the mentor entity ID, not the generic user ID
      const [studentsResponse, conversationsResponse] = await Promise.all([
        getMyStudents(mentorId),
        getMentorConversations(mentorId),
      ]);

      console.log("Students response:", studentsResponse);
      console.log("Conversations response:", conversationsResponse);

      // Get all students
      const students = studentsResponse.success ? studentsResponse.data : [];
      // Get existing conversations
      const existingConversations = conversationsResponse.data.success
        ? conversationsResponse.data.data
        : [];

      console.log(
        "📊 Existing conversations with unread counts:",
        existingConversations,
      );

      const studentMap = new Map();
      students.forEach((student) => {
        studentMap.set(student.studentId, student);
      });

      const mergedMap = new Map();

      // Include ALL students who have sent messages (even if not formally assigned)
      existingConversations.forEach((conv) => {
        mergedMap.set(conv.studentId, {
          studentId: conv.studentId,
          studentName:
            conv.studentName ||
            studentMap.get(conv.studentId)?.name ||
            "Student",
          lastMessage: conv.lastMessage || "No messages yet",
          lastMessageTime: conv.lastMessageTime || "",
          unreadCount: conv.unreadCount || 0,
        });
      });

      // Also include assigned students who haven't chatted yet
      students.forEach((student) => {
        if (!mergedMap.has(student.studentId)) {
          mergedMap.set(student.studentId, {
            studentId: student.studentId,
            studentName: student.name,
            lastMessage: "No messages yet",
            lastMessageTime: "",
            unreadCount: 0,
          });
        }
      });

      const mergedConversations = Array.from(mergedMap.values()).sort(
        (a, b) => {
          const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
          if (unreadDiff !== 0) return unreadDiff;
          return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
        },
      );

      console.log("Merged conversations:", mergedConversations);
      setConversations(mergedConversations);
      setFilteredConversations(mergedConversations);
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

  const buildNoteDownloadUrl = (notePath) => {
    if (!notePath) return "";
    if (/^https?:\/\//i.test(notePath)) {
      return notePath;
    }

    const normalizedPath = notePath.startsWith("/") ? notePath : `/${notePath}`;
    return `${window.location.origin}${normalizedPath}`;
  };

  const renderMessageContent = (content) => {
    if (!content) return "";

    const noteLinkMatch = content.match(/https?:\/\/[^\s]+\/api\/notes\/download\/[^\s]+|\/api\/notes\/download\/[^\s]+/i);
    if (noteLinkMatch) {
      const href = buildNoteDownloadUrl(noteLinkMatch[0]);
      return (
        <a href={href} target="_blank" rel="noreferrer" className="chat-note-link">
          Open shared PDF
        </a>
      );
    }

    return content;
  };

  const handleSharePdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent || !mentorId) {
      return;
    }

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        alert('Please select a PDF file only.');
        event.target.value = '';
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('PDF must be smaller than 20 MB.');
        event.target.value = '';
        return;
      }

      const uploadFile = file.type === 'application/pdf'
        ? file
        : new File([file], file.name, { type: 'application/pdf' });

      const sessionsResponse = await getStudentSessions(selectedStudent.studentId);
      const sessions = sessionsResponse?.data || [];
      const matchingSession = sessions.find(
        (session) =>
          Number(session.mentorId) === Number(mentorId) &&
          !['CANCELLED', 'CANCELLED_BY_STUDENT', 'CANCELLED_BY_MENTOR'].includes(
            String(session.status).toUpperCase(),
          ),
      );

      if (!matchingSession?.sessionId) {
        alert('No active matching session is available for this student.');
        event.target.value = '';
        return;
      }

      const uploadResponse = await uploadSessionNote(
        mentorId,
        matchingSession.sessionId,
        file.name,
        `PDF shared from chat for ${selectedStudent.studentName}`,
        'PDF',
        uploadFile,
      );

      const uploadedNote = uploadResponse?.data?.data || uploadResponse?.data || {};
      const sharedLink = buildNoteDownloadUrl(
        uploadedNote.fileUrl || `/api/notes/download/${file.name}`,
      );

      const messageData = {
        mentorId,
        studentId: selectedStudent.studentId,
        content: sharedLink,
        senderType: 'MENTOR',
      };

      await sendChatMessage(messageData);

      const optimisticMessage = {
        messageId: Date.now(),
        mentorId,
        studentId: selectedStudent.studentId,
        senderType: 'MENTOR',
        content: sharedLink,
        sentAt: new Date().toISOString(),
        isRead: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Failed to share PDF:', error);
      const serverMessage = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || error.message;
      alert(serverMessage || 'Failed to share PDF to the student.');
    } finally {
      event.target.value = '';
    }
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
      sendChatMessage(messageData);
      setNewMessage("");
      const optimisticMessage = {
        messageId: Date.now(),
        mentorId,
        studentId: selectedStudent.studentId,
        senderType: "MENTOR",
        content: messageData.content,
        sentAt: new Date().toISOString(),
        isRead: true,
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      await markMessagesAsRead(mentorId, selectedStudent.studentId);
      loadConversations();
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

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      disconnectChatSocket();
      if (conversationPollingInterval.current) {
        clearInterval(conversationPollingInterval.current);
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  if (!isOpen && !embedded) return null;

  const chatContent = (
    <div className={`chat-modal ${embedded ? "chat-modal-embedded" : ""}`} onClick={(e) => e.stopPropagation()}>
      <div className="chat-modal-topbar">
        <div>
          <h3>Messages</h3>
          <p>Connect with your students in real time.</p>
        </div>
        {!embedded && (
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        )}
      </div>
      <div className="chat-body">
        {!selectedStudent ? (
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <div>
                <h4>Student conversations</h4>
                <p>Recent chats and assigned students</p>
              </div>
            </div>
            <div className="chat-search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students or messages..."
              />
            </div>
            <div className="chat-conversations">
              {loading ? (
                <div className="loading">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  No students found. Refresh or wait for a chat to start.
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.studentId}
                    className={`conversation-item ${conv.unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => handleSelectStudent(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.studentName?.charAt(0) || "S"}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">
                        {conv.studentName}
                      </div>
                      <div className="conversation-last-message">
                        {conv.lastMessage || "Start a conversation"}
                      </div>
                    </div>
                    <div className="conversation-meta">
                      {conv.lastMessageTime ? (
                        <span>{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      ) : (
                        <span className="no-time">—</span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="conversation-unread-badge">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="chat-main">
            <div className="chat-main-header">
              <button
                className="back-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ← Back
              </button>
              <div className="chat-recipient-info">
                <div className="conversation-avatar large">
                  {selectedStudent.studentName?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="conversation-name selected">
                    {selectedStudent.studentName}
                  </div>
                  <div className="conversation-status">
                    Student • Active
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-messages-panel">
              {loading && messages.length === 0 ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  Start the conversation with {selectedStudent.studentName}.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`message ${msg.senderType === "MENTOR" ? "sent" : "received"} ${
                      msg.senderType !== "MENTOR" && !msg.isRead ? "unread" : ""
                    }`}
                  >
                    <div className="message-bubble">
                      {renderMessageContent(msg.content)}
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

            <div className="chat-input-area">
              <input
                ref={noteFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={handleSharePdf}
              />
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="button"
                  className="send-btn"
                  onClick={() => noteFileInputRef.current?.click()}
                >
                  PDF
                </button>
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

  if (embedded) {
    return chatContent;
  }

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      {chatContent}
    </div>
  );
};

export default ChatModal;
