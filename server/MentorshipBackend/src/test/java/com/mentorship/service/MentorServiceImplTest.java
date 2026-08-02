package com.mentorship.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mentorship.dtos.MentorDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.User;
import com.mentorship.entities.VerificationStatus;
import com.mentorship.repository.FeedbackRepository;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.SessionRepository;

@ExtendWith(MockitoExtension.class)
class MentorServiceImplTest {

    @Mock
    private MentorRepository mentorRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private SessionRepository sessionRepository;

    @InjectMocks
    private MentorServiceImpl mentorService;

    @Test
    void getPublicMentors_shouldOnlyReturnVerifiedMentors() {
        Mentor verifiedMentor = createMentor(1L, "Alice", VerificationStatus.VERIFIED);
        Mentor pendingMentor = createMentor(2L, "Bob", VerificationStatus.PENDING);

        when(mentorRepository.findAll()).thenReturn(List.of(verifiedMentor, pendingMentor));
        when(feedbackRepository.calculateAverageRating(anyLong())).thenReturn(0.0);
        when(feedbackRepository.countFeedbackByMentor(anyLong())).thenReturn(0);
        when(sessionRepository.findByMentor_MentorId(anyLong())).thenReturn(List.of());

        List<MentorDTO> result = mentorService.getPublicMentors(null);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getMentorId());
        assertEquals("VERIFIED", result.get(0).getVerificationStatus());
    }

    private Mentor createMentor(Long mentorId, String name, VerificationStatus status) {
        Mentor mentor = new Mentor();
        mentor.setMentorId(mentorId);
        mentor.setVerificationStatus(status);
        mentor.setRatePerSession(500.0);
        mentor.setDiscountPercent(0.0);

        User user = new User();
        user.setUserId(100L + mentorId);
        user.setFirstName(name);
        user.setLastName("Mentor");
        user.setEmail(name.toLowerCase() + "@example.com");
        mentor.setUserDetails(user);

        return mentor;
    }
}
