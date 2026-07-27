package com.mentorship.service;

import java.util.List;

import com.mentorship.dtos.ConversationDTO;
import com.mentorship.dtos.MessageDTO;
import com.mentorship.dtos.SendMessageDTO;

public interface MessageService {
    
    // Send a message from mentor to student
    MessageDTO sendMessage(SendMessageDTO sendMessageDTO);
    
    // Get conversation between mentor and student
    List<MessageDTO> getConversation(Long mentorId, Long studentId);
    
    // Mark messages as read (mentor marking student messages)
    void markMessagesAsRead(Long mentorId, Long studentId);
    
    // Mark messages as read (student marking mentor messages)
    void markMentorMessagesAsReadForStudent(Long mentorId, Long studentId);
    
    // Get all conversations for a mentor
    List<ConversationDTO> getMentorConversations(Long mentorId);
    
    // Get all conversations for a student
    List<ConversationDTO> getStudentConversations(Long studentId);
    
    // Get unread count for a specific conversation
    Long getUnreadCount(Long mentorId, Long studentId);
}
