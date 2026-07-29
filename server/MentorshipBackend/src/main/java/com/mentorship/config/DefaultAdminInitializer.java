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

    // Read admin details from environment / properties. If no values are supplied,
    // fall back to a hardcoded admin account so mentor verification can still be
    // performed in local/dev environments without extra setup.
    @Value("${default.admin.email:admin@mentorconnect.com}")
    private String adminEmail;

    @Value("${default.admin.password:Admin@1234}")
    private String adminPassword;

    @Value("${default.admin.first-name:}")
    private String adminFirstName;

    @Value("${default.admin.last-name:}")
    private String adminLastName;

    @Value("${default.admin.address:}")
    private String adminAddress;

    @Override
    public void run(String... args) {

        String resolvedEmail = (adminEmail == null || adminEmail.isBlank()) ? "admin@mentorconnect.com" : adminEmail;
        String resolvedPassword = (adminPassword == null || adminPassword.isBlank()) ? "Admin@1234" : adminPassword;

        if (resolvedEmail == null || resolvedEmail.isBlank() || resolvedPassword == null || resolvedPassword.isBlank()) {
            log.info("No default admin credentials provided; skipping auto-creation. Set 'default.admin.email' and 'default.admin.password' to create one at startup.");
            return;
        }

        if (userRepository.findByEmail(resolvedEmail).isPresent()) {
            log.info("Default admin user already exists: {}", resolvedEmail);
            return;
        }

        User admin = new User();
        admin.setFirstName(adminFirstName != null && !adminFirstName.isBlank() ? adminFirstName : "Admin");
        admin.setLastName(adminLastName != null && !adminLastName.isBlank() ? adminLastName : "User");
        admin.setEmail(resolvedEmail);
        admin.setPassword(passwordEncoder.encode(resolvedPassword));
        admin.setAddress(adminAddress != null ? adminAddress : "");
        admin.setUserRole(UserRole.ADMIN);

        // Try to assign a default admin image from classpath resources (static/images/default-admin.svg)
        try {
            var is = DefaultAdminInitializer.class.getResourceAsStream("/static/images/default-admin.svg");
            if (is != null) {
                byte[] img = is.readAllBytes();
                admin.setImage(img);
            } else {
                log.warn("Default admin image resource not found: /static/images/default-admin.svg");
            }
        } catch (Exception e) {
            log.warn("Failed to load default admin image", e);
        }

        userRepository.save(admin);

        log.info("Created default admin account: {}", resolvedEmail);
    }
}