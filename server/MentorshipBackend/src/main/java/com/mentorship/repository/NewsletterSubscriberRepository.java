package com.mentorship.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentorship.entities.NewsletterSubscriber;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {

    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
}
