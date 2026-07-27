package com.mentorship.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.dtos.ConversationDTO;
import com.mentorship.dtos.MessageDTO;
import com.mentorship.dtos.SendMessageDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Message;
import com.mentorship.entities.Student;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.MessageRepository;
import com.mentorship.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;

    @Override
    public MessageDTO sendMessage(SendMessageDTO sendMessageDTO) {
        Mentor mentor = mentorRepository.findById(sendMessageDTO.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + sendMessageDTO.getMentorId()));
        
        Student student = studentRepository.findById(sendMessageDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + sendMessageDTO.getStudentId()));
        
        // Use senderType from DTO, default to MENTOR if not provided for backward compatibility
        String senderType = sendMessageDTO.getSenderType() != null ? sendMessageDTO.getSenderType() : "MENTOR";
        
        Message message = Message.builder()
                .mentor(mentor)
                .student(student)
                .senderType(senderType)
                .content(sendMessageDTO.getContent())
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .build();
        
        Message savedMessage = messageRepository.save(message);
        return convertToDTO(savedMessage);
    }

    @Override
    public List<MessageDTO> getConversation(Long mentorId, Long studentId) {
        List<Message> messages = messageRepository.findConversation(mentorId, studentId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void markMessagesAsRead(Long mentorId, Long studentId) {
        messageRepository.markMessagesAsRead(mentorId, studentId);
    }

    @Override
    @Transactional
    public void markMentorMessagesAsReadForStudent(Long mentorId, Long studentId) {
        messageRepository.markMentorMessagesAsReadForStudent(mentorId, studentId);
    }

    @Override
    public List<ConversationDTO> getMentorConversations(Long mentorId) {
        System.out.println("🔍 Getting conversations for mentorId: " + mentorId);
        List<Long> studentIds = messageRepository.findStudentIdsChattedWithMentor(mentorId);
        System.out.println("📋 Found " + studentIds.size() + " students who chatted with mentor");
        List<ConversationDTO> conversations = new ArrayList<>();
        
        for (Long studentId : studentIds) {
            System.out.println("👤 Processing studentId: " + studentId);
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) continue;
            
            List<Message> messages = messageRepository.findConversation(mentorId, studentId);
            if (messages.isEmpty()) continue;
            
            Message lastMessage = messages.get(messages.size() - 1);
            Long unreadCount = messageRepository.countUnreadMessagesForMentor(mentorId, studentId);
            
            System.out.println("📧 Student: " + student.getUserDetails().getFirstName() + 
                             " - Unread count: " + unreadCount + 
                             " - Last message sender: " + lastMessage.getSenderType() +
                             " - Last message read: " + lastMessage.getIsRead());
            
            ConversationDTO conversation = ConversationDTO.builder()
                    .studentId(studentId)
                    .studentName(student.getUserDetails().getFirstName() + " " + 
                               student.getUserDetails().getLastName())
                    .lastMessage(lastMessage.getContent())
                    .lastMessageTime(formatDateTime(lastMessage.getSentAt()))
                    .unreadCount(unreadCount)
                    .build();
            
            conversations.add(conversation);
        }
        
        System.out.println("✅ Returning " + conversations.size() + " conversations");
        return conversations;
    }

    @Override
    public Long getUnreadCount(Long mentorId, Long studentId) {
        return messageRepository.countUnreadMessagesForMentor(mentorId, studentId);
    }

    @Override
    public List<ConversationDTO> getStudentConversations(Long studentId) {
        List<Long> mentorIds = messageRepository.findMentorIdsChattedWithStudent(studentId);
        List<ConversationDTO> conversations = new ArrayList<>();
        
        for (Long mentorId : mentorIds) {
            Mentor mentor = mentorRepository.findById(mentorId).orElse(null);
            if (mentor == null) continue;
            
            List<Message> messages = messageRepository.findConversation(mentorId, studentId);
            if (messages.isEmpty()) continue;
            
            Message lastMessage = messages.get(messages.size() - 1);
            Long unreadCount = messageRepository.countUnreadMessagesForStudent(mentorId, studentId);
            
            ConversationDTO conversation = ConversationDTO.builder()
                    .mentorId(mentorId)
                    .mentorName(mentor.getUserDetails().getFirstName() + " " + 
                               mentor.getUserDetails().getLastName())
                    .lastMessage(lastMessage.getContent())
                    .lastMessageTime(formatDateTime(lastMessage.getSentAt()))
                    .unreadCount(unreadCount)
                    .build();
            
            conversations.add(conversation);
        }
        
        return conversations;
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .messageId(message.getMessageId())
                .mentorId(message.getMentor().getMentorId())
                .studentId(message.getStudent().getStudentId())
                .studentName(message.getStudent().getUserDetails().getFirstName() + " " + 
                           message.getStudent().getUserDetails().getLastName())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .isRead(message.getIsRead())
                .build();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        
        if (dateTime.toLocalDate().equals(now.toLocalDate())) {
            return dateTime.format(DateTimeFormatter.ofPattern("hh:mm a"));
        } else if (dateTime.toLocalDate().equals(now.toLocalDate().minusDays(1))) {
            return "Yesterday";
        } else {
            return dateTime.format(DateTimeFormatter.ofPattern("MMM dd"));
        }
    }
}
