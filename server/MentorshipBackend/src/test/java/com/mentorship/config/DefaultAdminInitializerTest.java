package com.mentorship.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.mentorship.entities.User;
import com.mentorship.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DefaultAdminInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DefaultAdminInitializer initializer;

    @Test
    void run_createsHardcodedAdminWhenNoPropertiesProvided() {
        ReflectionTestUtils.setField(initializer, "adminEmail", "");
        ReflectionTestUtils.setField(initializer, "adminPassword", "");
        ReflectionTestUtils.setField(initializer, "adminFirstName", "");
        ReflectionTestUtils.setField(initializer, "adminLastName", "");
        ReflectionTestUtils.setField(initializer, "adminAddress", "");

        when(userRepository.findByEmail("admin@mentorconnect.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Admin@1234")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        initializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedAdmin = userCaptor.getValue();
        assertEquals("admin@mentorconnect.com", savedAdmin.getEmail());
        assertEquals("Admin", savedAdmin.getFirstName());
        assertEquals("User", savedAdmin.getLastName());
    }
}
