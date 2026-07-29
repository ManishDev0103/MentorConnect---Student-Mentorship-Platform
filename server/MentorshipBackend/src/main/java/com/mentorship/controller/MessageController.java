package com.mentorship.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.ConversationDTO;
import com.mentorship.dtos.MessageDTO;
import com.mentorship.dtos.SendMessageDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Student;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;

    // Helper method to resolve userIds to mentorId and studentId
    private Long[] resolveUserIds(Long userId1, Long userId2) {
        Long mentorId = null;
        Long studentId = null;

        // Check if userId1 is a mentor
        Mentor mentor1 = mentorRepository.findByUserId(userId1).orElse(null);
        if (mentor1 != null) {
            mentorId = mentor1.getMentorId();
        }

        // Check if userId1 is a student
        Student student1 = studentRepository.findByUserDetails_UserId(userId1).orElse(null);
        if (student1 != null) {
            studentId = student1.getStudentId();
        }

        // Check if userId2 is a mentor
        Mentor mentor2 = mentorRepository.findByUserId(userId2).orElse(null);
        if (mentor2 != null) {
            mentorId = mentor2.getMentorId();
        }

        // Check if userId2 is a student
        Student student2 = studentRepository.findByUserDetails_UserId(userId2).orElse(null);
        if (student2 != null) {
            studentId = student2.getStudentId();
        }

        if (mentorId == null || studentId == null) {
            String errorMsg = String.format(
                "Invalid user IDs: userId1=%d (mentor=%s, student=%s), userId2=%d (mentor=%s, student=%s)", 
                userId1, (mentor1 != null ? "found" : "not found"), (student1 != null ? "found" : "not found"),
                userId2, (mentor2 != null ? "found" : "not found"), (student2 != null ? "found" : "not found")
            );
            throw new IllegalArgumentException(errorMsg);
        }

        return new Long[]{mentorId, studentId};
    }

    // Send a message (works for both mentor and student)
    @PostMapping("/send")
    public ResponseEntity<ApiResponseDTO<MessageDTO>> sendMessage(@RequestBody SendMessageDTO sendMessageDTO) {
        try {
            MessageDTO message = messageService.sendMessage(sendMessageDTO);
            return ResponseEntity.ok(ApiResponseDTO.success("Message sent successfully", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to send message: " + e.getMessage()));
        }
    }

    // Get conversation between two users (mentor and student)
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<ApiResponseDTO<List<MessageDTO>>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            Long[] ids = resolveUserIds(userId1, userId2);
            Long mentorId = ids[0];
            Long studentId = ids[1];
            
            List<MessageDTO> messages = messageService.getConversation(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Conversation retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversation: " + e.getMessage()));
        }
    }

    // Mark messages as read
    @PutMapping("/mark-read/{userId1}/{userId2}")
    public ResponseEntity<ApiResponseDTO<String>> markAsRead(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            Long[] ids = resolveUserIds(userId1, userId2);
            Long mentorId = ids[0];
            Long studentId = ids[1];
            
            messageService.markMessagesAsRead(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Messages marked as read", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to mark messages as read: " + e.getMessage()));
        }
    }

    // Get all conversations for a user (mentor or student)
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<ApiResponseDTO<List<ConversationDTO>>> getUserConversations(
            @PathVariable Long userId) {
        try {
            List<ConversationDTO> conversations;
            var mentorOpt = mentorRepository.findByUserId(userId);
            if (mentorOpt.isPresent()) {
                conversations = messageService.getMentorConversations(mentorOpt.get().getMentorId());
            } else {
                var studentOpt = studentRepository.findByUserDetails_UserId(userId);
                if (studentOpt.isPresent()) {
                    conversations = messageService.getStudentConversations(studentOpt.get().getStudentId());
                } else {
                    throw new IllegalArgumentException("No mentor or student found for userId: " + userId);
                }
            }
            return ResponseEntity.ok(ApiResponseDTO.success("Conversations retrieved successfully", conversations));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversations: " + e.getMessage()));
        }
    }

    // Get unread count between two users
    @GetMapping("/unread-count/{userId1}/{userId2}")
    public ResponseEntity<ApiResponseDTO<Long>> getUnreadCount(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            Long[] ids = resolveUserIds(userId1, userId2);
            Long mentorId = ids[0];
            Long studentId = ids[1];
            
            Long count = messageService.getUnreadCount(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Unread count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to get unread count: " + e.getMessage()));
        }
    }

    // ========================================
    // Direct Mentor-Student Endpoints (using entity IDs directly)
    // ========================================

    // Get conversation between mentor and student using their entity IDs
    @GetMapping("/mentor/{mentorId}/student/{studentId}")
    public ResponseEntity<ApiResponseDTO<List<MessageDTO>>> getConversationByEntityIds(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        try {
            List<MessageDTO> messages = messageService.getConversation(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Conversation retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversation: " + e.getMessage()));
        }
    }

    // Get conversation from student perspective (student entity ID first)
    @GetMapping("/student/{studentId}/mentor/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<MessageDTO>>> getConversationForStudent(
            @PathVariable Long studentId,
            @PathVariable Long mentorId) {
        try {
            List<MessageDTO> messages = messageService.getConversation(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Conversation retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversation: " + e.getMessage()));
        }
    }

    // Mark messages as read between mentor and student using their entity IDs
    // Mark as read for mentor (marks STUDENT messages as read)
    @PutMapping("/mentor/{mentorId}/student/{studentId}/mark-read")
    public ResponseEntity<ApiResponseDTO<String>> markAsReadByEntityIds(
            @PathVariable Long mentorId,
            @PathVariable Long studentId) {
        try {
            messageService.markMessagesAsRead(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Messages marked as read", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to mark messages as read: " + e.getMessage()));
        }
    }
    
    // Mark as read for student (marks MENTOR messages as read)
    @PutMapping("/student/{studentId}/mentor/{mentorId}/mark-read")
    public ResponseEntity<ApiResponseDTO<String>> markMentorMessagesAsReadForStudent(
            @PathVariable Long studentId,
            @PathVariable Long mentorId) {
        try {
            messageService.markMentorMessagesAsReadForStudent(mentorId, studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Mentor messages marked as read", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to mark messages as read: " + e.getMessage()));
        }
    }

    // Get all conversations for a student using student entity ID
    @GetMapping("/student/{studentId}/conversations")
    public ResponseEntity<ApiResponseDTO<List<ConversationDTO>>> getStudentConversations(
            @PathVariable Long studentId) {
        try {
            List<ConversationDTO> conversations = messageService.getStudentConversations(studentId);
            return ResponseEntity.ok(ApiResponseDTO.success("Conversations retrieved successfully", conversations));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversations: " + e.getMessage()));
        }
    }

    // Get all conversations for a mentor using mentor entity ID
    @GetMapping("/mentor/{mentorId}/conversations")
    public ResponseEntity<ApiResponseDTO<List<ConversationDTO>>> getMentorConversations(
            @PathVariable Long mentorId) {
        try {
            List<ConversationDTO> conversations = messageService.getMentorConversations(mentorId);
            return ResponseEntity.ok(ApiResponseDTO.success("Conversations retrieved successfully", conversations));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseDTO.error("Failed to retrieve conversations: " + e.getMessage()));
        }
    }
}

