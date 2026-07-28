package com.mentorship.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:projectmail40734593@gmail.com}")
    private String fromEmail;

    private void sendSimpleEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String body = "Hello,\n\n"
                + "You requested to reset your password. Click the link below to proceed:\n"
                + resetUrl + "\n\n"
                + "This link will expire in 15 minutes.\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "Thanks,\nMentorship Team";

        sendSimpleEmail(toEmail, "Password Reset Request - Mentorship Platform", body);
    }

    public void sendMentorVerificationEmail(String toEmail, String mentorName, boolean approved, String adminName) {
        String subject = approved
                ? "Mentor Verification Approved"
                : "Mentor Verification Rejected";

        StringBuilder body = new StringBuilder();
        body.append("Hello ");
        body.append(mentorName != null ? mentorName : "Mentor");
        body.append(",\n\n");

        if (approved) {
            body.append("Your mentor profile has been approved by ");
            body.append(adminName != null ? adminName : "the admin team");
            body.append(". You can now appear in mentor listings and accept session bookings.\n\n");
            body.append("Thank you for joining the Mentorship Platform!\n");
        } else {
            body.append("Your mentor profile has been rejected by ");
            body.append(adminName != null ? adminName : "the admin team");
            body.append(". Please review your profile and supporting documents, then re-submit for verification.\n\n");
            body.append("If you need help, please contact support.\n");
        }

        body.append("Thanks,\nMentorship Team");
        sendSimpleEmail(toEmail, subject, body.toString());
    }

    public void sendSessionBookingConfirmationEmail(String toEmail, String studentName,
            String mentorName, String sessionDate, String startTime, String topic) {
        String subject = "Session Booking Received";
        String body = "Hello " + (studentName != null ? studentName : "Student") + ",\n\n"
                + "Your session booking request has been received. Here are the details:\n"
                + "Mentor: " + mentorName + "\n"
                + "Topic: " + topic + "\n"
                + "Date: " + sessionDate + "\n"
                + "Start time: " + startTime + "\n\n"
                + "Your session is currently pending payment. Once the payment is completed, you will receive a confirmation email.\n\n"
                + "Thanks,\nMentorship Team";
        sendSimpleEmail(toEmail, subject, body);
    }

    public void sendSessionBookingNotificationToMentor(String toEmail, String studentName,
            String sessionDate, String startTime, String topic) {
        String subject = "New Session Booking Request";
        String body = "Hello Mentor,\n\n"
                + "A new session booking request has been created by " + studentName + ".\n"
                + "Topic: " + topic + "\n"
                + "Date: " + sessionDate + "\n"
                + "Start time: " + startTime + "\n\n"
                + "Please review the booking and await payment confirmation.\n\n"
                + "Thanks,\nMentorship Team";
        sendSimpleEmail(toEmail, subject, body);
    }

    public void sendSessionPaymentStatusEmail(String toEmail, String studentName,
            String mentorName, String sessionDate, String startTime, Double amount, String status) {
        String subject;
        StringBuilder body = new StringBuilder();
        body.append("Hello " + (studentName != null ? studentName : "Student") + ",\n\n");

        if ("SUCCESS".equalsIgnoreCase(status)) {
            subject = "Session Payment Confirmed";
            body.append("Your payment for the session with " + mentorName + " has been successfully processed.\n");
            body.append("Session date: " + sessionDate + "\n");
            body.append("Start time: " + startTime + "\n");
            body.append("Amount: ₹" + amount + "\n\n");
            body.append("The session is now confirmed and scheduled.\n\n");
        } else if ("REFUNDED".equalsIgnoreCase(status)) {
            subject = "Session Payment Refunded";
            body.append("Your payment for the session with " + mentorName + " has been refunded.\n");
            body.append("Session date: " + sessionDate + "\n");
            body.append("Start time: " + startTime + "\n");
            body.append("Amount refunded: ₹" + amount + "\n\n");
            body.append("The refund has been processed and your session has been cancelled.\n\n");
        } else {
            subject = "Session Payment Failed";
            body.append("Your payment for the session with " + mentorName + " could not be completed.\n");
            body.append("Session date: " + sessionDate + "\n");
            body.append("Start time: " + startTime + "\n");
            body.append("Amount: ₹" + amount + "\n\n");
            body.append("Please try again or contact support if the issue persists.\n\n");
        }

        body.append("Thanks,\nMentorship Team");
        sendSimpleEmail(toEmail, subject, body.toString());
    }
}
