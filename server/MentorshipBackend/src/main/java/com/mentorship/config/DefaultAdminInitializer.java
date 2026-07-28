package com.mentorship.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.mentorship.entities.User;
import com.mentorship.entities.UserRole;
import com.mentorship.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Read admin details from environment / properties. No defaults are provided
    // to avoid committing credentials in source control. Set these as env vars
    // (e.g. DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD) or Spring properties.
    @Value("${default.admin.email:}")
    private String adminEmail;

    @Value("${default.admin.password:}")
    private String adminPassword;

    @Value("${default.admin.first-name:}")
    private String adminFirstName;

    @Value("${default.admin.last-name:}")
    private String adminLastName;

    @Value("${default.admin.address:}")
    private String adminAddress;

    @Override
    public void run(String... args) {

        // If email or password are not provided, skip auto-creation.
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("No default admin credentials provided; skipping auto-creation. Set 'default.admin.email' and 'default.admin.password' to create one at startup.");
            return;
        }

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Default admin user already exists: {}", adminEmail);
            return;
        }

        User admin = new User();
        admin.setFirstName(adminFirstName != null && !adminFirstName.isBlank() ? adminFirstName : "Admin");
        admin.setLastName(adminLastName != null && !adminLastName.isBlank() ? adminLastName : "User");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setAddress(adminAddress != null ? adminAddress : "");
        admin.setUserRole(UserRole.ADMIN);

        userRepository.save(admin);

        log.info("Created default admin account: {}", adminEmail);
    }
}