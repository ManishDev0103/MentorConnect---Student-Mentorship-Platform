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

    @Value("${default.admin.email:admin@mentorship.com}")
    private String adminEmail;

    @Value("${default.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${default.admin.first-name:Default}")
    private String adminFirstName;

    @Value("${default.admin.last-name:Admin}")
    private String adminLastName;

    @Value("${default.admin.address:Default admin account}")
    private String adminAddress;

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Default admin user already exists: {}", adminEmail);
            return;
        }

        User admin = new User();
        admin.setFirstName(adminFirstName);
        admin.setLastName(adminLastName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setAddress(adminAddress);
        admin.setUserRole(UserRole.ADMIN);

        userRepository.save(admin);

        log.info("Created default admin account: {}", adminEmail);
    }
}