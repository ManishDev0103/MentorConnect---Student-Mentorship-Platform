package com.mentorship.controller;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.NewsletterSubscriptionRequest;
import com.mentorship.entities.NewsletterSubscriber;
import com.mentorship.repository.NewsletterSubscriberRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponseDTO<Void>> subscribe(
            @Valid @RequestBody NewsletterSubscriptionRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (newsletterSubscriberRepository.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.ok(ApiResponseDTO.success("This email is already subscribed", null));
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setEmail(email);
        subscriber.setSubscribedAt(LocalDateTime.now());
        newsletterSubscriberRepository.save(subscriber);

        return ResponseEntity.ok(ApiResponseDTO.success("Subscription successful", null));
    }
}
