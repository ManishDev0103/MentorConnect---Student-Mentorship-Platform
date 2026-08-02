package com.mentorship.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.mentorship.dtos.MessageDTO;
import com.mentorship.dtos.SendMessageDTO;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.service.MessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageDTO payload) {
        try {
            if (payload == null || payload.getContent() == null || payload.getContent().isBlank()) {
                log.warn("WebSocket chat rejected: empty message content");
                return;
            }

            if (payload.getMentorId() == null || payload.getStudentId() == null) {
                log.warn("WebSocket chat rejected: missing mentor/student ids");
                return;
            }

            if (payload.getMentorId().equals(payload.getStudentId())) {
                log.warn("WebSocket chat rejected: user cannot chat with themselves");
                return;
            }

            String senderType = payload.getSenderType();
            if (senderType == null || (!senderType.equals("MENTOR") && !senderType.equals("STUDENT"))) {
                senderType = "STUDENT";
            }

            MessageDTO savedMessage = messageService.sendMessage(payload);
            log.info("Message saved via WebSocket for mentorId={} studentId={}", payload.getMentorId(), payload.getStudentId());

            String receiverDestination = "/queue/messages";
            String targetPrincipal = senderType.equals("MENTOR") ?
                    determineStudentPrincipal(payload.getStudentId()) :
                    determineMentorPrincipal(payload.getMentorId());

            if (targetPrincipal != null) {
                messagingTemplate.convertAndSendToUser(targetPrincipal, receiverDestination, savedMessage);
                log.info("Delivered chat message to principal {} destination {}", targetPrincipal, receiverDestination);
            } else {
                log.warn("Could not resolve target principal for chat delivery");
            }
        } catch (Exception ex) {
            log.error("Failed to process WebSocket chat message", ex);
        }
    }

    private String determineMentorPrincipal(Long mentorId) {
        return mentorRepository.findById(mentorId)
                .map(mentor -> mentor.getUserDetails().getEmail())
                .orElse(null);
    }

    private String determineStudentPrincipal(Long studentId) {
        return studentRepository.findById(studentId)
                .map(student -> student.getUserDetails().getEmail())
                .orElse(null);
    }
}
