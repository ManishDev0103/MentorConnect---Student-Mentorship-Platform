package com.mentorship.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentorship.entities.PasswordResetToken;
import com.mentorship.entities.User;

public interface ResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

	Optional<PasswordResetToken> findByToken(String token);
    
    // Optional: Clean up old tokens for a specific user
    void deleteByUser(User user);
}
